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

export const pangkatGolongans = pgTable(
  "pangkat_golongans",
  {
    id: id(),
    uuid: uuid(),
    jenjang: text("jenjang").notNull(),
    pangkat: text("pangkat").notNull(),
    golongan: text("golongan").notNull(),
    ruang: text("ruang").notNull(),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("pangkat_golongans_uuid_idx").using("hash", table.uuid),
  }),
);

export const pangkatGolonganConfig: LookupConfig = {
  name: "pangkat-golongan",
  table: pangkatGolongans,
  columns: [
    { key: "jenjang", label: "Jenjang" },
    { key: "pangkat", label: "Pangkat" },
    { key: "golongan", label: "Golongan" },
    { key: "ruang", label: "Ruang" },
  ],
};
