"use server"

import { db } from "@/db"
import { users } from "@/db/schemas"
import { magicLinks } from "@/db/schemas/magic-links"
import { catchError } from "@/lib/errros"
import { emailSchema } from "@/lib/validations"
import { eq } from "drizzle-orm"
import { generateId } from "lucia"
import { z } from "zod"
import jwt from "jsonwebtoken"

const generateMagicLink = async (email: string, userId: string) => {
  const token = jwt.sign({ email: email, userId }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  })

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/api/callbacks/email?token=${token}`

  console.log({ token, url })
  return {
    success: true,
    message: "Magic link generated successfully",
    data: {
      token,
      url,
    },
  }
}

export const signIn = async (values: z.infer<typeof emailSchema>) => {
  try {
    emailSchema.parse(values)

    const existedUser = await db.query.users.findFirst({
      where: eq(users.email, values.email),
    })

    if (existedUser) {
      const res = await generateMagicLink(values.email, existedUser.id)

      await db.insert(magicLinks).values({
        userId: existedUser.id,
        token: res.data.token,
      })

      console.log(res.data)
    } else {
      // we will create the user
      const userId = generateId(15)

      await db.insert(users).values({
        email: values.email,
        id: userId,
      })

      const res = await generateMagicLink(values.email, userId)

      await db.insert(magicLinks).values({
        userId,
        token: res.data.token,
      })
    }

    return {
      data: null,
      error: null,
    }
  } catch (error) {
    return catchError(error)
  }
}
