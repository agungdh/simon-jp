import { date, index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";
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

export const materiPpms = pgTable(
  "materi_ppms",
  {
    id: id(),
    uuid: uuid(),
    nomorSurat: text("nomor_surat"),
    namaPemateri: text("nama_pemateri"),
    materiPengembangan: text("materi_pengembangan").notNull(),
    tanggalPelaksanaan: date("tanggal_pelaksanaan").notNull(),
    linkMateri: text("link_materi"),
    linkDokumentasi: text("link_dokumentasi"),
    createdAt: createdAt(),
    createdBy: createdBy(),
    updatedAt: updatedAt(),
    updatedBy: updatedBy(),
    deletedAt: deletedAt(),
    deletedBy: deletedBy(),
  },
  (table) => ({
    uuidIdx: index("materi_ppms_uuid_idx").using("hash", table.uuid),
    nomorSuratIdx: index("materi_ppms_nomor_surat_idx").on(table.nomorSurat),
    tanggalIdx: index("materi_ppms_tanggal_idx").on(table.tanggalPelaksanaan),
  }),
);
