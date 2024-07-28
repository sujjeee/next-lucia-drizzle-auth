import { Google } from "arctic"

export const google = new Google(
  process.env.GOOGLE_CLIENT_ID!,
  process.env.GOOGLE_CLIENT_ID_CLIENT_SECRET!,
  process.env.NEXT_PUBLIC_APP_URL! + "/api/callbacks/google",
)
