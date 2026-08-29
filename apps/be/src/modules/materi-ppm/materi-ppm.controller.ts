import { Elysia, t } from "elysia";
import { authGuard, resolveAuth } from "../../plugins/auth";
import { HttpError } from "../../plugins/error";
import { materiPpmService } from "./materi-ppm.service";
import {
  materiPpmCreateSchema,
  materiPpmResponseSchema,
  materiPpmUpdateSchema,
} from "./materi-ppm.dto";

export const materiPpmController = new Elysia()
  .derive(resolveAuth)
  .onBeforeHandle(authGuard)
  .get("/materi-ppm", () => materiPpmService.list(), {
    response: t.Array(materiPpmResponseSchema),
  })
  .get("/materi-ppm/:uuid", ({ params }) => materiPpmService.get(params.uuid), {
    response: materiPpmResponseSchema,
  })
  .post(
    "/materi-ppm",
    ({ body, auth }: any) => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      return materiPpmService.create(body);
    },
    { body: materiPpmCreateSchema, response: materiPpmResponseSchema },
  )
  .put(
    "/materi-ppm/:uuid",
    ({ params, body, auth }: any) => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      return materiPpmService.update(params.uuid, body);
    },
    { body: materiPpmUpdateSchema, response: materiPpmResponseSchema },
  )
  .delete("/materi-ppm/:uuid", ({ params, auth }: any) => {
    if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
    materiPpmService.remove(params.uuid);
    return { message: "Deleted" };
  });
