import { index, pgTable, text, uniqueIndex, integer, pgEnum } from "drizzle-orm/pg-core";
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
import { bidangs } from "../bidang/bidang.entity";
import { pangkatGolongans } from "../pangkat-golongan/pangkat-golongan.entity";

export const tipeEnum = pgEnum("tipe", ["pegawai", "admin"]);
export const statusEnum = pgEnum("status", ["aktif", "non aktif"]);
export const kategoriJabatanEnum = pgEnum("kategori_jabatan", [
  "struktural",
  "fungsional auditor",
  "fungsional tertentu",
]);
export const kategoriKebutuhanEnum = pgEnum(
  "kategori_kebutuhan_jam_pelatihan",
  ["admin", "pejabat", "auditor"],
);

export const users = pgTable(
  "users",
  {
    id: id(),
    uuid: uuid(),
    nip: text("nip").notNull(),
    password: text("password").notNull(),
    nama: text("nama").notNull(),
    bidangId: integer("bidang_id").references(() => bidangs.id),
    pangkatGolonganId: integer("pangkat_golongan_id").references(
      () => pangkatGolongans.id,
    ),
    tipe: tipeEnum("tipe").default("pegawai").notNull(),
    status: statusEnum("status").default("aktif").notNull(),
    jabatan: text("jabatan"),
    peran: text("peran"),
    kategoriJabatan: kategoriJabatanEnum("kategori_jabatan"),
    kategoriKebutuhanJamPelatihan: kategoriKebutuhanEnum(
      "kategori_kebutuhan_jam_pelatihan",
    ),
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
