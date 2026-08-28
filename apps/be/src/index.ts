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
        name: users.name,
        email: users.email,
        createdAt: users.createdAt,
      })
      .from(users),
  );

const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`🦊 Elysia BE running at http://localhost:${port}`);
});
