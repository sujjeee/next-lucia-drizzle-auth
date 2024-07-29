"use client"

import { Toaster } from "@/components/ui/toaster"
import { IPProvider } from "@/lib/context"
import * as React from "react"

export function Providers({
  children,
  realIp,
}: {
  realIp: string | null
  children: React.ReactNode
}) {
  return (
    <IPProvider realIP={realIp}>
      {children}
      <Toaster />
    </IPProvider>
  )
}
