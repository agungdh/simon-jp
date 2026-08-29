import { Elysia, t } from "elysia";
import { extractSessionToken } from "../../lib/token";
import { serializeCookie } from "../../lib/cookie";
import { authService } from "./auth.service";
import { loginRequestSchema, loginResponseSchema } from "./auth.dto";

const SESSION_TTL = 60 * 60 * 24 * 7;
const secure = process.env.SESSION_SECURE === "true";

const sessionCookie = (value: string, maxAge: number) =>
  serializeCookie("session", value, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge,
  });

export const authController = new Elysia()
  .post(
    "/auth/login",
    async ({ body, set }) => {
      const result = await authService.login(body.nip, body.password);

      set.headers["Set-Cookie"] = sessionCookie(result.token, SESSION_TTL);

      return { token: result.token, user: result.user };
    },
    { body: loginRequestSchema, response: loginResponseSchema },
  )
  .post("/auth/logout", async ({ request, set }) => {
    await authService.logout(extractSessionToken(request));

    set.headers["Set-Cookie"] = sessionCookie("", 0);

    return { message: "Logged out" };
  });
