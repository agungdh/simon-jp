import { db } from "../../db";
import { and, eq, isNull, sql } from "drizzle-orm";
import { users } from "./user.entity";
import { bidangs } from "../bidang/bidang.entity";
import { pangkatGolongans } from "../pangkat-golongan/pangkat-golongan.entity";

export const userRepository = {
  profileSelect() {
    return {
      uuid: users.uuid,
      nip: users.nip,
      nama: users.nama,
      tipe: users.tipe,
      status: users.status,
      jabatan: users.jabatan,
      peran: users.peran,
      kategoriJabatan: users.kategoriJabatan,
      kategoriKebutuhanJamPelatihan: users.kategoriKebutuhanJamPelatihan,
      bidangUuid: bidangs.uuid,
      bidang: bidangs.bidang,
      pangkatGolonganUuid: pangkatGolongans.uuid,
      jenjang: pangkatGolongans.jenjang,
      pangkat: pangkatGolongans.pangkat,
      golongan: pangkatGolongans.golongan,
      ruang: pangkatGolongans.ruang,
    };
  },

  async list() {
    return db
      .select(this.profileSelect())
      .from(users)
      .leftJoin(bidangs, eq(users.bidangId, bidangs.id))
      .leftJoin(
        pangkatGolongans,
        eq(users.pangkatGolonganId, pangkatGolongans.id),
      )
      .where(isNull(users.deletedAt))
      .orderBy(users.nama);
  },

  async getByUuid(uuid: string) {
    const [row] = await db
      .select(this.profileSelect())
      .from(users)
      .leftJoin(bidangs, eq(users.bidangId, bidangs.id))
      .leftJoin(
        pangkatGolongans,
        eq(users.pangkatGolonganId, pangkatGolongans.id),
      )
      .where(and(eq(users.uuid, uuid), isNull(users.deletedAt)))
      .limit(1);
    return row;
  },

  async findByNip(nip: string) {
    return db
      .select({
        id: users.id,
        uuid: users.uuid,
        nip: users.nip,
        password: users.password,
        nama: users.nama,
        tipe: users.tipe,
      })
      .from(users)
      .where(and(eq(users.nip, nip), isNull(users.deletedAt)))
      .limit(1);
  },

  async resolveId(table: any, uuid: string): Promise<number> {
    const [row] = await db
      .select({ id: table.id })
      .from(table)
      .where(eq(table.uuid, uuid))
      .limit(1);
    if (!row) throw new Error("referensi tidak valid");
    return row.id;
  },

  async create(values: any) {
    const [row] = await db
      .insert(users)
      .values(values)
      .returning({ uuid: users.uuid });
    return row;
  },

  async update(uuid: string, values: any) {
    await db.update(users).set(values).where(eq(users.uuid, uuid));
    return this.getByUuid(uuid);
  },

  async remove(uuid: string) {
    await db
      .update(users)
      .set({ deletedAt: new Date() })
      .where(eq(users.uuid, uuid));
  },
};
