import { db } from "../../db";
import { and, eq, isNull } from "drizzle-orm";
import { users } from "./user.entity";

export const userRepository = {
  async findAll() {
    return db
      .select({
        uuid: users.uuid,
        nip: users.nip,
        nama: users.nama,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        deletedAt: users.deletedAt,
      })
      .from(users)
      .where(isNull(users.deletedAt));
  },

  async findByUuid(uuid: string) {
    return db
      .select({
        uuid: users.uuid,
        nip: users.nip,
        nama: users.nama,
      })
      .from(users)
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .limit(1);
  },

  async findByNip(nip: string) {
    return db
      .select()
      .from(users)
      .where(and(eq(users.nip, nip), isNull(users.deletedAt)))
      .limit(1);
  },
};
