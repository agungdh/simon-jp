import { t } from "elysia";

export const tipeSchema = t.Union([
  t.Literal("pegawai"),
  t.Literal("admin"),
]);

export const statusSchema = t.Union([
  t.Literal("aktif"),
  t.Literal("non aktif"),
]);

export const kategoriJabatanSchema = t.Union([
  t.Literal("struktural"),
  t.Literal("fungsional auditor"),
  t.Literal("fungsional tertentu"),
]);

export const kategoriKebutuhanSchema = t.Union([
  t.Literal("admin"),
  t.Literal("pejabat"),
  t.Literal("auditor"),
]);

export const userProfileSchema = t.Object({
  uuid: t.String(),
  nip: t.String(),
  nama: t.String(),
  tipe: tipeSchema,
  status: statusSchema,
  jabatan: t.Nullable(t.String()),
  peran: t.Nullable(t.String()),
  kategoriJabatan: t.Nullable(kategoriJabatanSchema),
  kategoriKebutuhanJamPelatihan: t.Nullable(kategoriKebutuhanSchema),
  bidang: t.Nullable(
    t.Object({ uuid: t.String(), bidang: t.String() }),
  ),
  pangkatGolongan: t.Nullable(
    t.Object({
      uuid: t.String(),
      jenjang: t.String(),
      pangkat: t.String(),
      golongan: t.String(),
      ruang: t.String(),
    }),
  ),
});

export const userCreateSchema = t.Object({
  nip: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
  nama: t.String({ minLength: 1 }),
  tipe: t.Optional(tipeSchema),
  status: t.Optional(statusSchema),
  jabatan: t.Optional(t.String()),
  peran: t.Optional(t.String()),
  kategoriJabatan: t.Optional(t.Nullable(kategoriJabatanSchema)),
  kategoriKebutuhanJamPelatihan: t.Optional(
    t.Nullable(kategoriKebutuhanSchema),
  ),
  bidangUuid: t.Optional(t.String()),
  pangkatGolonganUuid: t.Optional(t.String()),
});

export const userUpdateSchema = t.Object({
  nip: t.Optional(t.String()),
  password: t.Optional(t.String()),
  nama: t.Optional(t.String()),
  tipe: t.Optional(tipeSchema),
  status: t.Optional(statusSchema),
  jabatan: t.Optional(t.Nullable(t.String())),
  peran: t.Optional(t.Nullable(t.String())),
  kategoriJabatan: t.Optional(t.Nullable(kategoriJabatanSchema)),
  kategoriKebutuhanJamPelatihan: t.Optional(
    t.Nullable(kategoriKebutuhanSchema),
  ),
  bidangUuid: t.Optional(t.Nullable(t.String())),
  pangkatGolonganUuid: t.Optional(t.Nullable(t.String())),
});

export const selfUpdateSchema = t.Object({
  nama: t.Optional(t.String()),
  password: t.Optional(t.String()),
  jabatan: t.Optional(t.Nullable(t.String())),
  peran: t.Optional(t.Nullable(t.String())),
  bidangUuid: t.Optional(t.String()),
  pangkatGolonganUuid: t.Optional(t.String()),
});

export type UserProfile = typeof userProfileSchema.static;
export type UserCreate = typeof userCreateSchema.static;
export type UserUpdate = typeof userUpdateSchema.static;
export type SelfUpdate = typeof selfUpdateSchema.static;
