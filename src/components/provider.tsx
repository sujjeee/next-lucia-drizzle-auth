"use client"

import { Toaster } from "@/components/ui/toaster"
import { IPProvider } from "@/lib/context"
import { headers } from "next/headers"
import * as React from "react"

export function Providers({ children }: { children: React.ReactNode }) {
  //   const realIp = headers().get("x-real-ip")
  const realIp = "172.16.58.3"

  return (
    <IPProvider realIP={realIp}>
      {children}
      <Toaster />
    </IPProvider>
  )
}
