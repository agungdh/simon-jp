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
import { jenisPelatihans } from "../jenis-pelatihan/jenis-pelatihan.entity";
import type { TrainingConfig } from "../../lib/training";

export const diklats = pgTable(
  "diklats",
  {
    id: id(),
    uuid: uuid(),
    userId: fkId("user_id").references(() => users.id),
    jenisPelatihanId: fkId("jenis_pelatihan_id").references(
      () => jenisPelatihans.id,
    ),
    nomorSurat: text("nomor_surat").notNull(),
    materiPengembangan: text("materi_pengembangan").notNull(),
    dariTanggalPelaksanaan: date("dari_tanggal_pelaksanaan").notNull(),
    sampaiTanggalPelaksanaan: date("sampai_tanggal_pelaksanaan").notNull(),
    jumlahJamPelatihan: integer("jumlah_jam_pelatihan").notNull(),
    filename: text("filename"),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("diklats_uuid_idx").using("hash", table.uuid),
    nomorSuratIdx: index("diklats_nomor_surat_idx").on(table.nomorSurat),
    dariIdx: index("diklats_dari_idx").on(table.dariTanggalPelaksanaan),
    sampaiIdx: index("diklats_sampai_idx").on(table.sampaiTanggalPelaksanaan),
  }),
);

export const diklatConfig: TrainingConfig = {
  name: "diklat",
  table: diklats,
  owner: true,
  adminOnlyWrite: true,
  columns: {
    materi: "materiPengembangan",
    jam: "jumlahJamPelatihan",
    dateMode: "range",
    dari: "dariTanggalPelaksanaan",
    sampai: "sampaiTanggalPelaksanaan",
    nomorSurat: "nomorSurat",
    jenisPelatihan: "jenisPelatihanId",
    filename: true,
  },
};
