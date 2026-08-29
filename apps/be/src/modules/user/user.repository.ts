import { db } from "../../db";
import { eq } from "drizzle-orm";
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
      })
      .from(users);
  },

  async findByUuid(uuid: string) {
    return db
      .select({
        uuid: users.uuid,
        nip: users.nip,
        nama: users.nama,
      })
      .from(users)
      .where(eq(users.uuid, uuid))
      .limit(1);
  },

  async findByNip(nip: string) {
    return db.select().from(users).where(eq(users.nip, nip)).limit(1);
  },
};
