import Redis from "ioredis";

const url = process.env.VALKEY_URL
  ? new URL(process.env.VALKEY_URL)
  : null;

const host = process.env.VALKEY_HOST ?? url?.hostname ?? "localhost";
const port = Number(process.env.VALKEY_PORT ?? url?.port ?? 6379);
const password =
  process.env.VALKEY_PASSWORD ?? url?.password ?? (url ? "" : "admin");

export const valkey = new Redis({
  host,
  port,
  password: password || undefined,
  maxRetriesPerRequest: 3,
  lazyConnect: false,
});
