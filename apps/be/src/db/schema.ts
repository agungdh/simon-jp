import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { id, uuid } from "./columns";

export const users = pgTable(
  "users",
  {
    id: id(),
    uuid: uuid(),
    nip: text("nip").notNull().unique(),
    password: text("password").notNull(),
    nama: text("nama").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    uuidIdx: index("users_uuid_idx").using("hash", table.uuid),
  }),
);
