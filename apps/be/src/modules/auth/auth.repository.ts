import { db } from "../../db";
import { and, eq, isNull } from "drizzle-orm";
import { users } from "../user/user.entity";
import { userRepository } from "../user/user.repository";

export type AuthUser = {
  uuid: string;
  nip: string;
  nama: string;
  tipe: "admin" | "pegawai";
  status: string;
};

export const authRepository = {
  findByNip(nip: string) {
    return userRepository.findByNip(nip);
  },

  async findByUuid(uuid: string): Promise<AuthUser | undefined> {
    const [row] = await db
      .select({
        uuid: users.uuid,
        nip: users.nip,
        nama: users.nama,
        tipe: users.tipe,
        status: users.status,
      })
      .from(users)
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .limit(1);
    return row;
  },
};
