import { db } from "./index";
import { users } from "./schema";

async function seed() {
  const existing = await db.select({ id: users.id }).from(users).limit(1);
  if (existing.length > 0) {
    console.log("users already seeded, skipping");
    return;
  }

  const nip = process.env.SEED_NIP ?? "123456789012345678";
  const rawPassword = process.env.SEED_PASSWORD ?? "admin123";
  const hashed = await Bun.password.hash(rawPassword);

  await db.insert(users).values({
    nip,
    password: hashed,
    nama: "Admin",
  });

  console.log(`seeded user: nip=${nip}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
