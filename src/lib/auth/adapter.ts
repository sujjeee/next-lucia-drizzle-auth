import { Lucia } from "lucia"
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle"
import { db } from "@/db"
import { sessions, User, users } from "@/db/schemas"

const adapter = new DrizzleSQLiteAdapter(db, sessions, users)

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.email,
    }
  },
})

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia
    DatabaseSessionAttributes: DatabaseSessionAttributes
    DatabaseUserAttributes: DatabaseUserAttributes
  }
}

interface DatabaseSessionAttributes {}
interface DatabaseUserAttributes extends Omit<User, "hashedPassword"> {}
