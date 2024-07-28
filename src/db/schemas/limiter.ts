import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const limiter = sqliteTable("limiter", {
  ip: text("address").primaryKey(),
  count: integer("count").notNull().default(0),
  expiresAt: integer("expires_at", { mode: "number" }).notNull(),
})
