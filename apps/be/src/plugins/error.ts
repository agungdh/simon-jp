import { ValidationError } from "elysia";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

const fieldLabel = (field: string) =>
  field === "nip" ? "NIP" : field.charAt(0).toUpperCase() + field.slice(1);

type ErrorContext = {
  error: unknown;
  set: { status?: number | string };
};

export const errorHandler = ({ error, set }: ErrorContext) => {
  if (error instanceof HttpError) {
    set.status = error.status;
    return { message: error.message };
  }

  if (error instanceof ValidationError) {
    set.status = 422;

    let parsed: { errors?: Array<Record<string, unknown>>; path?: string; property?: string; message?: string; summary?: string; value?: unknown } | null = null;
    try {
      parsed = JSON.parse((error as unknown as { message: string }).message);
    } catch {
      parsed = null;
    }

    const list = parsed?.errors ?? (parsed ? [parsed] : []);
    const errors: Record<string, string> = {};

    for (const raw of list) {
      const e = raw as { path?: string; property?: string; message?: string; summary?: string; value?: unknown };
      const field = String(e.path ?? e.property ?? "").replace(/^\//, "");
      if (!field) continue;

      const label = fieldLabel(field);
      const msg =
        e.value === "" || e.value === undefined
          ? `${label} wajib diisi`
          : (e.message ?? e.summary ?? "Invalid value");
      errors[field] = msg;
    }

    return {
      message: "Validation failed",
      errors,
    };
  }

  set.status = 500;
  return { message: "Internal Server Error" };
};
