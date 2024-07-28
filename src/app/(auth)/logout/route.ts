import { lucia } from "@/lib/auth/adapter"
import { validateRequest } from "@/lib/auth/validate"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

export async function GET(request: Request): Promise<Response> {
  const { session } = await validateRequest()
  const url = new URL(request.url)
  const returnTo = url.searchParams.get("returnTo") || "/"

  if (!session) {
    // If there's no session, redirect to the returnTo URL
    return redirect(returnTo)
  }

  // If there is a session, proceed with logout
  await lucia.invalidateSession(session.id)
  const sessionCookie = lucia.createBlankSessionCookie()
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes,
  )

  // After logout, redirect to the returnTo URL
  return redirect(returnTo)
}
