"use server"

import { catchError } from "@/lib/errros"
import { google } from "@/lib/auth/oauths"
import { generateCodeVerifier, generateState } from "arctic"

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
