import { Elysia } from "elysia";
import {
  extractSessionToken,
  getSession,
  type SessionData,
} from "../lib/token";
import { authRepository, type AuthUser } from "../modules/auth/auth.repository";

export const resolveAuth = async ({ request }: { request: Request }) => {
  const token = extractSessionToken(request);
  const session = token ? await getSession(token) : null;
  const auth = session ? await authRepository.findByUuid(session.uuid) : null;
  return { auth: (auth ?? null) as AuthUser | null };
};

export const authGuard = ({ auth, set }: { auth: AuthUser | null; set: any }) => {
  if (!auth) {
    set.status = 401;
    return { message: "Unauthorized" };
  }
};

export const auth = new Elysia({ name: "auth" }).derive(resolveAuth);
