import { Metadata } from "next"
import Link from "next/link"
import { EmailForm } from "@/components/email-form"
import { Command } from "lucide-react"
import { redirect } from "next/navigation"
import { validateRequest } from "@/auth/actions"

export const metadata: Metadata = {
  title: "Login",
}

export default async function LoginPage() {
  const { session } = await validateRequest()
  if (session) return redirect("/")

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <Command className="mx-auto h-6 w-6" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <EmailForm />
        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/register"
            className="hover:text-brand underline underline-offset-4"
          >
            Don&apos;t have an account? Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
