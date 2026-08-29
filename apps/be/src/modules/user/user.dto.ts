import { t } from "elysia";

export const userResponseSchema = t.Object({
  uuid: t.String(),
  nip: t.String(),
  nama: t.String(),
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const userListResponseSchema = t.Array(userResponseSchema);

export const meResponseSchema = t.Array(
  t.Object({
    uuid: t.String(),
    nip: t.String(),
    nama: t.String(),
  }),
);

export type UserResponse = typeof userResponseSchema.static;
export type UserListResponse = typeof userListResponseSchema.static;
export type MeResponse = typeof meResponseSchema.static;
