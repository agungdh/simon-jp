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
import type { LookupConfig } from "../../lib/lookup";

export const bidangs = pgTable(
  "bidangs",
  {
    id: id(),
    uuid: uuid(),
    bidang: text("bidang").notNull(),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("bidangs_uuid_idx").using("hash", table.uuid),
    bidangActiveUniq: uniqueIndex("bidangs_bidang_active_uniq")
      .on(table.bidang)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const bidangConfig: LookupConfig = {
  name: "bidang",
  table: bidangs,
  columns: [{ key: "bidang", label: "Bidang" }],
};
