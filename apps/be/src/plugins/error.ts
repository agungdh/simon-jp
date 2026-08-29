export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "HttpError";
  }
}

type ErrorContext = {
  error: unknown;
  set: { status?: number | string };
};

export const errorHandler = ({ error, set }: ErrorContext) => {
  if (error instanceof HttpError) {
    set.status = error.status;
    return { message: error.message };
  }

  set.status = 500;
  return { message: "Internal Server Error" };
};

