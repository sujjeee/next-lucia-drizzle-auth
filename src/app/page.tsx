import { getCurrentUser } from "@/auth/actions"
import { Button } from "@/components/ui/button"

import Link from "next/link"
import { redirect } from "next/navigation"

import React from "react"

export default async function Page() {
  const { user } = await getCurrentUser()
  if (!user) return redirect("/login")

  return (
    <div className=" flex justify-center items-center h-screen ">
      <div className=" flex flex-col justify-center items-center  h-full gap-5">
        <div>
          Hey
          <a
            href={`mailto:${user.email}`}
            className="font-medium text-blue-500 hover:underline ml-1"
          >
            {user.email}
          </a>
          !
        </div>
        <div className=" w-full">
          <Button asChild>
            <Link href="/logout" prefetch={false}>
              Logout
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
