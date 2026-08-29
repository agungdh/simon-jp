import { Elysia } from "elysia";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export const errorHandler = new Elysia({ name: "errorHandler" }).onError(
  ({ error, set }) => {
    if (error instanceof HttpError) {
      set.status = error.status;
      return { message: error.message };
    }

    set.status = 500;
    return { message: "Internal Server Error" };
  },
);
