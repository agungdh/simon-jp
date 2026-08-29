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

export const ppms = pgTable(
  "ppms",
  {
    id: id(),
    uuid: uuid(),
    userId: fkId("user_id").references(() => users.id),
    nomorSurat: text("nomor_surat").notNull(),
    materiPengembangan: text("materi_pengembangan").notNull(),
    tanggalPelaksanaan: date("tanggal_pelaksanaan").notNull(),
    jumlahJamPelatihan: integer("jumlah_jam_pelatihan").notNull(),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("ppms_uuid_idx").using("hash", table.uuid),
    nomorSuratIdx: index("ppms_nomor_surat_idx").on(table.nomorSurat),
    tanggalIdx: index("ppms_tanggal_idx").on(table.tanggalPelaksanaan),
  }),
);

export const ppmConfig: TrainingConfig = {
  name: "ppm",
  table: ppms,
  owner: true,
  adminOnlyWrite: true,
  bulkCreate: true,
  columns: {
    materi: "materiPengembangan",
    jam: "jumlahJamPelatihan",
    dateMode: "single",
    singleDate: "tanggalPelaksanaan",
    nomorSurat: "nomorSurat",
  },
};
