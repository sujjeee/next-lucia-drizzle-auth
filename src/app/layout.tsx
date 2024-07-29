import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/provider"
import { headers } from "next/headers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quick Auth",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const realIp = headers().get("x-real-ip") || "123.123.123.123"

  return (
    <html lang="en">
      <body className={`dark ${inter.className}`}>
        <Providers realIp={realIp}>{children}</Providers>
      </body>
    </html>
  )
}
