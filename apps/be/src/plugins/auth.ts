import { Elysia } from "elysia";
import {
  extractSessionToken,
  getSession,
  type SessionData,
} from "../lib/token";

export const resolveAuth = async ({ request }: { request: Request }) => {
  const token = extractSessionToken(request);
  const session = token ? await getSession(token) : null;
  return { auth: session as SessionData | null };
};

export const authGuard = ({ auth, set }: { auth: SessionData | null; set: any }) => {
  if (!auth) {
    set.status = 401;
    return { message: "Unauthorized" };
  }
};

export const auth = new Elysia({ name: "auth" }).derive(resolveAuth);
