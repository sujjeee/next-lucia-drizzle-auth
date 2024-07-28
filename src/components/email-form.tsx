"use client"

import React from "react"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { emailSchema } from "@/lib/validations"
import { Input } from "./ui/input"
import { Button, buttonVariants } from "./ui/button"
import { Icons } from "./icons"
import { showErrorToast } from "@/lib/errros"
import { cn } from "@/lib/utils"
import { createGoogleAuthURL, signInWithEmail } from "@/auth/actions"

type Input = z.infer<typeof emailSchema>

export function EmailForm() {
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)

  const form = useForm<Input>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(formData: Input) {
    try {
      setIsLoading(true)

      const { error } = await signInWithEmail({
        email: formData.email,
      })

      if (error) throw new Error(error)

      toast("Email sent! Please check your inbox to verify.")
      form.reset()
    } catch (error) {
      showErrorToast(error)
    } finally {
      setIsLoading(false)
    }
  }

  async function onGoogleAuth() {
    try {
      setIsGoogleLoading(true)

      const { data, error } = await createGoogleAuthURL()
      if (error) throw new Error(error)

      if (data) return (window.location.href = data)
    } catch (error) {
      showErrorToast(error)
    } finally {
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-2">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="w-full" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            )}
            Continue with Email
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>
      <button
        type="button"
        className={cn(buttonVariants({ variant: "outline" }))}
        disabled={isGoogleLoading}
        onClick={onGoogleAuth}
      >
        {isGoogleLoading ? (
          <Icons.spinner
            className="mr-2 size-4 animate-spin"
            aria-hidden="true"
          />
        ) : (
          <Icons.google className="mr-2 size-4" aria-hidden="true" />
        )}
        Continue with Google
      </button>
    </div>
  )
}
