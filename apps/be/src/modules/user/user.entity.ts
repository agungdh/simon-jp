import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  createdAt,
  createdBy,
  deletedAt,
  deletedBy,
  id,
  updatedAt,
  updatedBy,
  uuid,
} from "../../db/columns";

export const users = pgTable(
  "users",
  {
    id: id(),
    uuid: uuid(),
    nip: text("nip").notNull(),
    password: text("password").notNull(),
    nama: text("nama").notNull(),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("users_uuid_idx").using("hash", table.uuid),
    nipActiveUniq: uniqueIndex("users_nip_active_uniq")
      .on(table.nip)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);
