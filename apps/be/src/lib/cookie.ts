export function parseCookies(header?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  }
  return out;
}

type SameSite = "lax" | "strict" | "none";

export function serializeCookie(
  name: string,
  value: string,
  opts: {
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: SameSite;
    path?: string;
  } = {},
): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.maxAge != null) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.httpOnly) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  return parts.join("; ");
}
