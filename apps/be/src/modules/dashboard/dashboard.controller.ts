import { Elysia, t } from "elysia";
import { authGuard, resolveAuth } from "../../plugins/auth";
import { HttpError } from "../../plugins/error";
import { dashboardService } from "./dashboard.service";
import {
  generatePegawaiPdf,
  generateRekapPdf,
  generatePksPdf,
} from "../../lib/pdf";

function currentYear() {
  return new Date().getFullYear();
}

function pdfResponse(buf: Buffer, filename: string) {
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

export const dashboardController = new Elysia()
  .derive(resolveAuth)
  .onBeforeHandle(authGuard)
  .get(
    "/dashboard",
    ({ query, auth }: any): any => {
      const tahun = Number(query.tahun) || currentYear();
      return dashboardService.computePegawai(auth!.uuid, tahun);
    },
    { response: t.Any() },
  )
  .get(
    "/dashboard/admin",
    ({ query, auth }: any): any => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      const tahun = Number(query.tahun) || currentYear();
      return dashboardService.adminList(tahun);
    },
    { response: t.Any() },
  )
  .get(
    "/dashboard/admin/:uuid",
    ({ params, query, auth }: any): any => {
      if (auth!.tipe !== "admin" && auth!.uuid !== params.uuid)
        throw new HttpError(403, "Forbidden");
      const tahun = Number(query.tahun) || currentYear();
      return dashboardService.computePegawai(params.uuid, tahun);
    },
    { response: t.Any() },
  )
  .get(
    "/dashboard/admin/pks",
    ({ query, auth }: any): any => {
      if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
      const tahun = Number(query.tahun) || currentYear();
      return dashboardService.pks(tahun);
    },
    { response: t.Any() },
  )
  .get("/dashboard/admin/print", ({ query, auth }: any): any => {
    if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
    const tahun = Number(query.tahun) || currentYear();
    return dashboardService.adminList(tahun).then((rows) =>
      generateRekapPdf(rows, tahun).then((buf) =>
        pdfResponse(buf, `rekap-admin-${tahun}.pdf`),
      ),
    );
  })
  .get("/dashboard/admin/print/:uuid", ({ params, query, auth }: any): any => {
    if (auth!.tipe !== "admin" && auth!.uuid !== params.uuid)
      throw new HttpError(403, "Forbidden");
    const tahun = Number(query.tahun) || currentYear();
    return dashboardService
      .computePegawai(params.uuid, tahun)
      .then((data) =>
        generatePegawaiPdf(data).then((buf) =>
          pdfResponse(buf, `rekap-${params.uuid}-${tahun}.pdf`),
        ),
      );
  })
  .get("/dashboard/admin/print-pks", ({ query, auth }: any): any => {
    if (auth!.tipe !== "admin") throw new HttpError(403, "Forbidden");
    const tahun = Number(query.tahun) || currentYear();
    return dashboardService.pks(tahun).then((data) =>
      generatePksPdf(data).then((buf) =>
        pdfResponse(buf, `pks-${tahun}.pdf`),
      ),
    );
  });
