"use server"

import { catchError } from "@/lib/errros"
import { google } from "./oauths"
import { generateCodeVerifier, generateState } from "arctic"
import { db } from "@/db"
import { users } from "@/db/schemas"
import { magicLinks } from "@/db/schemas/magic-links"
import { emailSchema } from "@/lib/validations"
import { eq } from "drizzle-orm"
import { generateId } from "lucia"
import { z } from "zod"
import jwt from "jsonwebtoken"
import { cache } from "react"
import type { Session, User } from "lucia"
import { lucia } from "./adapter"

import { cookies } from "next/headers"

export async function createGoogleAuthURL() {
  try {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()

    cookies().set("google_oauth_state", state, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
    })

    cookies().set("google_code_verifier", codeVerifier, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 60 * 10,
    })

    const authUrl = await google.createAuthorizationURL(state, codeVerifier, {
      scopes: ["email"],
    })

    authUrl.searchParams.append("prompt", "consent")

    return {
      data: authUrl.href,
      error: null,
    }
  } catch (error) {
    return catchError(error)
  }
}

export async function signInWithEmail(values: z.infer<typeof emailSchema>) {
  try {
    emailSchema.parse(values)

    const existedUser = await db.query.users.findFirst({
      where: eq(users.email, values.email),
    })

    if (existedUser) {
      const res = await generateMagicLink(values.email, existedUser.id)

      await db.insert(magicLinks).values({
        userId: existedUser.id,
        token: res.data.token,
      })

      console.log(res.data)
    } else {
      // we will create the user
      const userId = generateId(15)

      await db.insert(users).values({
        email: values.email,
        id: userId,
      })

      const res = await generateMagicLink(values.email, userId)

      await db.insert(magicLinks).values({
        userId,
        token: res.data.token,
      })
    }

    return {
      data: null,
      error: null,
    }
  } catch (error) {
    return catchError(error)
  }
}

export async function generateMagicLink(email: string, userId: string) {
  const token = jwt.sign({ email: email, userId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  })

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/callbacks/email?token=${token}`

  console.log({ token, url })
  return {
    success: true,
    message: "Magic link generated successfully",
    data: {
      token,
      url,
    },
  }
}

const uncachedValidateRequest = async (): Promise<
  { user: User; session: Session } | { user: null; session: null }
> => {
  const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null
  if (!sessionId) {
    return { user: null, session: null }
  }
  const result = await lucia.validateSession(sessionId)
  // next.js throws when you attempt to set cookie when rendering page
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id)
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie()
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes,
      )
    }
  } catch {
    console.error("Failed to set session cookie")
  }
  return result
}

export const validateRequest = cache(uncachedValidateRequest)
