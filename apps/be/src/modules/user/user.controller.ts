import { Elysia } from "elysia";
import { authGuard, resolveAuth } from "../../plugins/auth";
import { userService } from "./user.service";
import { meResponseSchema, userListResponseSchema } from "./user.dto";

export const userController = new Elysia()
  .derive(resolveAuth)
  .onBeforeHandle(authGuard)
  .get("/users", () => userService.list(), {
    response: userListResponseSchema,
  })
  .get("/me", ({ auth }) => userService.getMe(auth!.uuid), {
    response: meResponseSchema,
  });
