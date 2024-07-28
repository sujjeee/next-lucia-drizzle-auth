import { validateRequest } from "@/lib/auth/validate"
import { redirect } from "next/navigation"

import React from "react"

export default async function Page() {
  const { user } = await validateRequest()
  console.log({ user })
  if (!user) return redirect(" /login")

  return <div>{user?.id}</div>
}
