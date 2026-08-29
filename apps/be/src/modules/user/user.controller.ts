import { Elysia, t } from "elysia";
import { authGuard, resolveAuth } from "../../plugins/auth";
import { HttpError } from "../../plugins/error";
import { userService } from "./user.service";
import {
  selfUpdateSchema,
  userCreateSchema,
  userProfileSchema,
  userUpdateSchema,
} from "./user.dto";

export const userController = new Elysia()
  .derive(resolveAuth)
  .onBeforeHandle(authGuard)
  .get(
    "/users",
    ({ auth }: any): any => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      return userService.list();
    },
    { response: t.Array(userProfileSchema) },
  )
  .get(
    "/users/:uuid",
    ({ params, auth }: any): any => {
      if (auth!.tipe !== "admin" && auth!.uuid !== params.uuid)
        throw new HttpError(403, "Forbidden");
      return userService.getByUuid(params.uuid);
    },
    { response: userProfileSchema },
  )
  .post(
    "/users",
    ({ body, auth }: any): any => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      return userService.create(body);
    },
    { body: userCreateSchema, response: userProfileSchema },
  )
  .put(
    "/users/:uuid",
    ({ params, body, auth }: any): any => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      return userService.update(params.uuid, body);
    },
    { body: userUpdateSchema, response: userProfileSchema },
  )
  .delete("/users/:uuid", ({ params, auth }: any) => {
    if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
    userService.remove(params.uuid);
    return { message: "Deleted" };
  })
  .get("/me", ({ auth }: any): any => userService.getByUuid(auth!.uuid), {
    response: userProfileSchema,
  })
  .put(
    "/me",
    ({ body, auth }: any): any => userService.selfUpdate(auth!.uuid, body),
    { body: selfUpdateSchema, response: userProfileSchema },
  );
