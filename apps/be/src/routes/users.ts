import { Elysia } from "elysia";
import { extractSessionToken, getSession } from "../lib/token";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export const userRoutes = new Elysia()
  .resolve(async ({ request }) => {
    const token = extractSessionToken(request);
    const session = token ? await getSession(token) : null;
    return { auth: session };
  })
  .onBeforeHandle(({ auth, set }) => {
    if (!auth) {
      set.status = 401;
      return { message: "Unauthorized" };
    }
  })
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
  )
  .get("/me", async ({ auth }) =>
    db
      .select({
        uuid: users.uuid,
        nip: users.nip,
        nama: users.nama,
      })
      .from(users)
      .where(eq(users.uuid, auth!.uuid))
      .limit(1),
  );
