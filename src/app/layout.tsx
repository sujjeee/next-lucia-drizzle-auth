import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quick Auth",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`dark ${inter.className}`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
