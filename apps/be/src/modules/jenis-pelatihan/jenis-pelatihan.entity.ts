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

export const jenisPelatihans = pgTable(
  "jenis_pelatihans",
  {
    id: id(),
    uuid: uuid(),
    jenisPelatihan: text("jenis_pelatihan").notNull(),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("jenis_pelatihans_uuid_idx").using("hash", table.uuid),
    jenisActiveUniq: uniqueIndex("jenis_pelatihans_jenis_active_uniq")
      .on(table.jenisPelatihan)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

export const jenisPelatihanConfig: LookupConfig = {
  name: "jenis-pelatihan",
  table: jenisPelatihans,
  columns: [{ key: "jenisPelatihan", label: "Jenis Pelatihan" }],
};
