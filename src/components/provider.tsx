"use client"

import { Toaster } from "@/components/ui/toaster"
import { IPProvider } from "@/lib/context"
import { headers } from "next/headers"
import * as React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  const realIp = headers().get("x-real-ip")

  return (
    <IPProvider realIP={realIp}>
      {children}
      <Toaster />
    </IPProvider>
  )
}
