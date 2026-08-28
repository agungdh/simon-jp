import { Elysia, t } from "elysia";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { createSession, deleteSession, extractSessionToken } from "../lib/token";
import { serializeCookie } from "../lib/cookie";

const SESSION_TTL = 60 * 60 * 24 * 7;
const secure = process.env.SESSION_SECURE === "true";

export const authRoutes = new Elysia({ prefix: "/api" })
  .post(
    "/auth/login",
    async ({ body, set, request }) => {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.nip, body.nip))
        .limit(1);

      if (!user || !(await Bun.password.verify(body.password, user.password))) {
        set.status = 401;
        return { message: "Invalid nip or password" };
      }

      const token = await createSession({
        uuid: user.uuid,
        nip: user.nip,
        nama: user.nama,
      });

      set.headers["Set-Cookie"] = serializeCookie("session", token, {
        httpOnly: true,
        secure,
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_TTL,
      });

      return {
        token,
        user: { uuid: user.uuid, nip: user.nip, nama: user.nama },
      };
    },
    {
      body: t.Object({
        nip: t.String(),
        password: t.String(),
      }),
    },
  )
  .post("/auth/logout", async ({ request, set }) => {
    const token = extractSessionToken(request);
    if (token) await deleteSession(token);

    set.headers["Set-Cookie"] = serializeCookie("session", "", {
      httpOnly: true,
      secure,
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return { message: "Logged out" };
  });
