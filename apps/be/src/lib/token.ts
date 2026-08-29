import { randomBytes } from "node:crypto";
import { valkey } from "./valkey";
import { parseCookies } from "./cookie";

const PREFIX = "session:";
const TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionData {
  id: number;
  uuid: string;
  nip: string;
  nama: string;
  tipe: "admin" | "pegawai";
}

export async function createSession(data: SessionData): Promise<string> {
  const token = randomBytes(32).toString("hex");
  await valkey.set(PREFIX + token, JSON.stringify(data), "EX", TTL_SECONDS);
  return token;
}

export async function getSession(
  token: string,
): Promise<SessionData | null> {
  const raw = await valkey.get(PREFIX + token);
  if (!raw) return null;
  // Sliding expiry: every access extends the TTL back to full.
  await valkey.expire(PREFIX + token, TTL_SECONDS);
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export async function deleteSession(token: string): Promise<void> {
  await valkey.del(PREFIX + token);
}

export function extractSessionToken(req: Request): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  const cookies = parseCookies(req.headers.get("cookie") ?? undefined);
  return cookies["session"] ?? null;
}
