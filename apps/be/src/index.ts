import { Elysia } from "elysia";
import { db } from "./db";
import { users } from "./db/schema";

const app = new Elysia()
  .get("/", () => ({ message: "Hello from Elysia BE" }))
  .get("/health", () => ({ status: "ok" }))
  .get("/users", async () =>
    db
      .select({
        uuid: users.uuid,
        nip: users.nip,
        nama: users.nama,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users),
  );

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`🦊 Elysia BE running at http://localhost:${port}`);
});
