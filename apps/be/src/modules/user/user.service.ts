import { HttpError } from "../../plugins/error";
import { userRepository } from "./user.repository";
import { bidangs } from "../bidang/bidang.entity";
import { pangkatGolongans } from "../pangkat-golongan/pangkat-golongan.entity";
import type { UserCreate, UserUpdate, SelfUpdate } from "./user.dto";

function shape(row: any) {
  if (!row) return row;
  const {
    bidangUuid,
    bidang,
    pangkatGolonganUuid,
    jenjang,
    pangkat,
    golongan,
    ruang,
    ...rest
  } = row;
  return {
    ...rest,
    bidang: bidangUuid
      ? { uuid: bidangUuid, bidang }
      : null,
    pangkatGolongan: pangkatGolonganUuid
      ? {
          uuid: pangkatGolonganUuid,
          jenjang,
          pangkat,
          golongan,
          ruang,
        }
      : null,
  };
}

export const userService = {
  async list() {
    const rows = await userRepository.list();
    return rows.map(shape);
  },

  async getByUuid(uuid: string) {
    const row = await userRepository.getByUuid(uuid);
    if (!row) throw new HttpError(404, "Not found");
    return shape(row);
  },

  async create(input: UserCreate) {
    const existing = await userRepository.findByNip(input.nip);
    if (existing.length > 0)
      throw new HttpError(400, "NIP sudah terdaftar");
    const values: any = {
      nip: input.nip,
      password: await Bun.password.hash(input.password),
      nama: input.nama,
      tipe: input.tipe ?? "pegawai",
      status: input.status ?? "aktif",
      jabatan: input.jabatan ?? null,
      peran: input.peran ?? null,
      kategoriJabatan: input.kategoriJabatan ?? null,
      kategoriKebutuhanJamPelatihan:
        input.kategoriKebutuhanJamPelatihan ?? null,
    };
    if (input.bidangUuid)
      values.bidangId = await userRepository.resolveId(
        bidangs,
        input.bidangUuid,
      );
    if (input.pangkatGolonganUuid)
      values.pangkatGolonganId = await userRepository.resolveId(
        pangkatGolongans,
        input.pangkatGolonganUuid,
      );
    const { uuid } = await userRepository.create(values);
    return this.getByUuid(uuid);
  },

  async update(uuid: string, input: UserUpdate) {
    await this.getByUuid(uuid);
    const values: any = {};
    if (input.nip) values.nip = input.nip;
    if (input.password) values.password = await Bun.password.hash(input.password);
    if (input.nama) values.nama = input.nama;
    if (input.tipe) values.tipe = input.tipe;
    if (input.status) values.status = input.status;
    if (input.jabatan !== undefined) values.jabatan = input.jabatan ?? null;
    if (input.peran !== undefined) values.peran = input.peran ?? null;
    if (input.kategoriJabatan !== undefined)
      values.kategoriJabatan = input.kategoriJabatan ?? null;
    if (input.kategoriKebutuhanJamPelatihan !== undefined)
      values.kategoriKebutuhanJamPelatihan =
        input.kategoriKebutuhanJamPelatihan ?? null;
    if (input.bidangUuid !== undefined)
      values.bidangId = input.bidangUuid
        ? await userRepository.resolveId(bidangs, input.bidangUuid)
        : null;
    if (input.pangkatGolonganUuid !== undefined)
      values.pangkatGolonganId = input.pangkatGolonganUuid
        ? await userRepository.resolveId(
            pangkatGolongans,
            input.pangkatGolonganUuid,
          )
        : null;
    return userRepository.update(uuid, values);
  },

  async selfUpdate(uuid: string, input: SelfUpdate) {
    const values: any = {};
    if (input.nama) values.nama = input.nama;
    if (input.password) values.password = await Bun.password.hash(input.password);
    if (input.jabatan !== undefined) values.jabatan = input.jabatan ?? null;
    if (input.peran !== undefined) values.peran = input.peran ?? null;
    if (input.bidangUuid)
      values.bidangId = await userRepository.resolveId(
        bidangs,
        input.bidangUuid,
      );
    if (input.pangkatGolonganUuid)
      values.pangkatGolonganId = await userRepository.resolveId(
        pangkatGolongans,
        input.pangkatGolonganUuid,
      );
    return userRepository.update(uuid, values);
  },

  async remove(uuid: string) {
    await this.getByUuid(uuid);
    return userRepository.remove(uuid);
  },
};
