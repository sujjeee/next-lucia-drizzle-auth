"use server"

import { db } from "@/db"
import { limiter } from "@/db/schemas"
import { eq, sql } from "drizzle-orm"

// Type-safe function to rate limit IP (not for production)
export async function rateLimitIP(
  ip: string,
  maxRequests: number,
  minutes: string,
): Promise<boolean> {
  const currentTime = Math.floor(Date.now() / 1000) // Current time in seconds
  const minutesValue = parseInt(minutes.replace("m", ""), 10)

  // Check if the IP is already in the database
  const existingRecord = await db.query.limiter.findFirst({
    where: eq(limiter.ip, ip),
  })

  if (existingRecord) {
    // If the IP exists, check if the count has expired
    if (existingRecord.expiresAt <= currentTime) {
      // If expired, reset the count and update the expiration time
      await db
        .update(limiter)
        .set({ count: 1, expiresAt: currentTime + minutesValue * 60 })
        .where(eq(limiter.ip, ip))
      return true // Allow the request
    } else {
      // If not expired, check if the count is within the limit
      if (existingRecord.count < maxRequests) {
        // If within the limit, increment the count
        await db
          .update(limiter)
          .set({ count: sql`${limiter.count} + 1` })
          .where(eq(limiter.ip, ip))
        return true // Allow the request
      } else {
        // If the limit is reached, deny the request
        return false
      }
    }
  } else {
    // If the IP does not exist, insert a new record
    await db
      .insert(limiter)
      .values({ ip: ip, count: 1, expiresAt: currentTime + minutesValue * 60 })
    return true // Allow the request
  }
}
