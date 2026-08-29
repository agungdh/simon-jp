import { date, index, integer, pgTable, text } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import {
  createdAt,
  createdBy,
  deletedAt,
  deletedBy,
  fkId,
  id,
  updatedAt,
  updatedBy,
  uuid,
} from "../../db/columns";
import { users } from "../user/user.entity";
import type { TrainingConfig } from "../../lib/training";

export const webinars = pgTable(
  "webinars",
  {
    id: id(),
    uuid: uuid(),
    userId: fkId("user_id").references(() => users.id),
    materiPengembangan: text("materi_pengembangan").notNull(),
    tanggalPelaksanaan: date("tanggal_pelaksanaan").notNull(),
    jumlahJam: integer("jumlah_jam").notNull(),
    filename: text("filename"),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("webinars_uuid_idx").using("hash", table.uuid),
    tanggalIdx: index("webinars_tanggal_idx").on(table.tanggalPelaksanaan),
  }),
);

export const webinarConfig: TrainingConfig = {
  name: "webinar",
  table: webinars,
  owner: true,
  adminOnlyWrite: false,
  columns: {
    materi: "materiPengembangan",
    jam: "jumlahJam",
    dateMode: "single",
    singleDate: "tanggalPelaksanaan",
    filename: true,
  },
};
