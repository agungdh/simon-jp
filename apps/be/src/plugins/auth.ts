import { Elysia } from "elysia";
import { extractSessionToken, getSession, type SessionData } from "../lib/token";

export const auth = new Elysia({ name: "auth" }).resolve(
  async ({ request }) => {
    const token = extractSessionToken(request);
    const session = token ? await getSession(token) : null;
    return { auth: session as SessionData | null };
  },
);
