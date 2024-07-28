import { cookies } from "next/headers"
import { OAuth2RequestError } from "arctic"
import { catchError } from "@/lib/errros"
import { google } from "@/lib/auth/oauths"
import { db } from "@/db"
import { eq } from "drizzle-orm"
import { users } from "@/db/schemas"
import { lucia } from "@/lib/auth/adapter"
import { generateIdFromEntropySize } from "lucia"

interface GoogleUser {
  id: string
  email: string
}

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const storedState = cookies().get("google_oauth_state")?.value ?? null
  const storedCodeVerifier =
    cookies().get("google_code_verifier")?.value ?? null

  if (
    !code ||
    !state ||
    !storedState ||
    !storedCodeVerifier ||
    state !== storedState
  ) {
    return new Response(null, {
      status: 404,
    })
  }

  try {
    const { accessToken } = await google.validateAuthorizationCode(
      code,
      storedCodeVerifier,
    )
    const response = await fetch(
      "https://openidconnect.googleapis.com/v1/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )

    const googleUser: GoogleUser = await response.json()

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, googleUser.email),
    })

    if (existingUser) {
      const session = await lucia.createSession(existingUser.id, {})
      const sessionCookie = lucia.createSessionCookie(session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
      return new Response(null, {
        status: 302,
        headers: {
          Location: "/",
        },
      })
    }

    const userId = generateIdFromEntropySize(10)

    await db.insert(users).values({
      email: googleUser.email,
      id: userId,
    })

    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(
      sessionCookie.name,
      sessionCookie.value,
      sessionCookie.attributes,
    )
    return new Response(null, {
      status: 302,
      headers: {
        Location: "/",
      },
    })
  } catch (e) {
    console.log(catchError(e))
    // the specific error message depends on the provider
    if (e instanceof OAuth2RequestError) {
      // invalid code
      return new Response(null, {
        status: 400,
      })
    }
    return new Response(null, {
      status: 500,
    })
  }
}
