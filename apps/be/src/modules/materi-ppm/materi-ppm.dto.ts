import { t } from "elysia";

export const materiPpmResponseSchema = t.Object({
  uuid: t.String(),
  nomorSurat: t.Nullable(t.String()),
  namaPemateri: t.Nullable(t.String()),
  materiPengembangan: t.String(),
  tanggalPelaksanaan: t.String(),
  linkMateri: t.Nullable(t.String()),
  linkDokumentasi: t.Nullable(t.String()),
});

export const materiPpmCreateSchema = t.Object({
  nomorSurat: t.Optional(t.String()),
  namaPemateri: t.Optional(t.String()),
  materiPengembangan: t.String({ minLength: 1 }),
  tanggalPelaksanaan: t.String(),
  linkMateri: t.Optional(t.String()),
  linkDokumentasi: t.Optional(t.String()),
});

export const materiPpmUpdateSchema = t.Object({
  nomorSurat: t.Optional(t.Nullable(t.String())),
  namaPemateri: t.Optional(t.Nullable(t.String())),
  materiPengembangan: t.Optional(t.String()),
  tanggalPelaksanaan: t.Optional(t.String()),
  linkMateri: t.Optional(t.Nullable(t.String())),
  linkDokumentasi: t.Optional(t.Nullable(t.String())),
});

export type MateriPpmResponse = typeof materiPpmResponseSchema.static;
export type MateriPpmCreate = typeof materiPpmCreateSchema.static;
export type MateriPpmUpdate = typeof materiPpmUpdateSchema.static;
