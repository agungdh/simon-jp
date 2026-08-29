import { db } from "./index";
import { users, bidangs, pangkatGolongans, jenisPelatihans } from "./schema";

const BIDANG_SEED = ["SUBBAGIAN KEPEGAWAIAN", "BIDANG INFORMASI", "BIDANG P2"];
const PANGKAT_SEED = [
  { jenjang: "III", pangkat: "Pengatur", golongan: "III", ruang: "a" },
  { jenjang: "IV", pangkat: "Pembina", golongan: "IV", ruang: "a" },
];
const JENIS_SEED = ["Teknis", "Fungsional", "Manajemen"];

async function seed() {
  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .limit(1);
  if (existingUser.length === 0) {
    const nip = process.env.SEED_NIP ?? "admin";
    const rawPassword = process.env.SEED_PASSWORD ?? "admin";
    await db.insert(users).values({
      nip,
      password: await Bun.password.hash(rawPassword),
      nama: "Admin",
      tipe: "admin",
      status: "aktif",
      kategoriKebutuhanJamPelatihan: "admin",
    } as any);
    console.log(`seeded admin user: nip=${nip}`);
  } else {
    console.log("users already seeded, skipping");
  }

  const bidangCount = await db
    .select({ id: bidangs.id })
    .from(bidangs)
    .limit(1);
  if (bidangCount.length === 0) {
    await db
      .insert(bidangs)
      .values(BIDANG_SEED.map((bidang) => ({ bidang })));
    console.log(`seeded ${BIDANG_SEED.length} bidangs`);
  }

  const pangkatCount = await db
    .select({ id: pangkatGolongans.id })
    .from(pangkatGolongans)
    .limit(1);
  if (pangkatCount.length === 0) {
    await db.insert(pangkatGolongans).values(PANGKAT_SEED);
    console.log(`seeded ${PANGKAT_SEED.length} pangkat golongan`);
  }

  const jenisCount = await db
    .select({ id: jenisPelatihans.id })
    .from(jenisPelatihans)
    .limit(1);
  if (jenisCount.length === 0) {
    await db
      .insert(jenisPelatihans)
      .values(JENIS_SEED.map((jenisPelatihan) => ({ jenisPelatihan })));
    console.log(`seeded ${JENIS_SEED.length} jenis pelatihan`);
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
