import { t } from "elysia";

export const loginRequestSchema = t.Object({
  nip: t.String({ minLength: 1 }),
  password: t.String({ minLength: 1 }),
});

export const loginResponseSchema = t.Object({
  token: t.String(),
  user: t.Object({
    uuid: t.String(),
    nip: t.String(),
    nama: t.String(),
    tipe: t.Union([t.Literal("pegawai"), t.Literal("admin")]),
  }),
});

export type LoginRequest = typeof loginRequestSchema.static;
export type LoginResponse = typeof loginResponseSchema.static;
