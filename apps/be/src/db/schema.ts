import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, uuid } from "./columns";

export const users = pgTable(
  "users",
  {
    id: id(),
    uuid: uuid(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uuidIdx: index("users_uuid_idx").using("hash", table.uuid),
  }),
);
