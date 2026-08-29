import PDFDocument from "pdfkit";
import { PassThrough } from "node:stream";
import type {
  DashboardPegawai,
  DashboardAdminRow,
  DashboardPks,
} from "../modules/dashboard/dashboard.service";

function render(
  build: (doc: PDFKit.PDFDocument) => void,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 30 });
    const chunks: Buffer[] = [];
    const stream = new PassThrough();
    stream.on("data", (c) => chunks.push(Buffer.from(c)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
    doc.pipe(stream);
    try {
      build(doc);
    } catch (e) {
      reject(e);
      return;
    }
    doc.end();
  });
}

function table(
  doc: PDFKit.PDFDocument,
  x: number,
  y: number,
  colWidths: number[],
  headers: string[],
  rows: (string | number)[][],
): number {
  const rowH = 18;
  let cy = y;
  doc.fontSize(9);
  const drawRow = (cells: (string | number)[], fill?: string) => {
    let cx = x;
    if (fill) {
      doc.rect(x, cy, colWidths.reduce((a, b) => a + b, 0), rowH).fill(fill);
    }
    cells.forEach((cell, i) => {
      doc.text(String(cell ?? ""), cx + 3, cy + 4, {
        width: colWidths[i] - 6,
        ellipsis: true,
      });
      cx += colWidths[i];
    });
    cy += rowH;
  };

  doc.font("Helvetica-Bold");
  drawRow(headers, "#eeeeee");
  doc.font("Helvetica");
  rows.forEach((r, i) => drawRow(r, i % 2 ? "#f7f7f7" : "#ffffff"));
  return cy;
}

export function generatePegawaiPdf(data: DashboardPegawai): Promise<Buffer> {
  return render((doc) => {
    doc.fontSize(14).text(`Rekapitulasi JP Pegawai - ${data.tahun}`, {
      align: "center",
    });
    doc.moveDown();
    doc.fontSize(10);
    doc.text(`NIP: ${data.nip}    Nama: ${data.nama}`);
    doc.text(
      `Kategori: ${data.kategori ?? "-"}    Minimal: ${data.jumlahMinimal} JP    Capaian: ${data.jumlahCapaian} JP (${data.persen}%)`,
    );
    doc.moveDown();
    table(
      doc,
      30,
      doc.y,
      [60, 110, 110, 90, 90],
      ["Triwulan", "Diklat", "PPM", "Seminar/Webinar/LC", "Total"],
      [
        ["1", "", "", "", data.triwulan_1],
        ["2", "", "", "", data.triwulan_2],
        ["3", "", "", "", data.triwulan_3],
        ["4", "", "", "", data.triwulan_4],
      ],
    );
    doc.moveDown();
    doc.fontSize(11).text("Detail Capaian per Modul", { underline: true });
    table(
      doc,
      30,
      doc.y,
      [150, 100],
      ["Modul", "JP"],
      Object.entries(data.detailCapaian).map(([k, v]) => [k, v]),
    );
    doc.moveDown();
    doc.fontSize(11).text("Detail Kegiatan", { underline: true });
    table(
      doc,
      30,
      doc.y,
      [90, 260, 80],
      ["Modul", "Materi", "Jam"],
      data.detailItems.map((d) => [
        d.modul,
        d.materi,
        d.jam,
      ]),
    );
  });
}

export function generateRekapPdf(
  rows: DashboardAdminRow[],
  year: number,
): Promise<Buffer> {
  return render((doc) => {
    doc.fontSize(14).text(`Rekapitulasi JP Admin - ${year}`, {
      align: "center",
    });
    doc.moveDown();
    table(
      doc,
      30,
      doc.y,
      [70, 130, 70, 70, 55, 55, 55, 55],
      [
        "NIP",
        "Nama",
        "Min",
        "Capaian",
        "%",
        "TW1",
        "TW2",
        "TW3",
      ],
      rows.map((r) => [
        r.nip,
        r.nama,
        r.jumlahMinimal,
        r.jumlahCapaian,
        r.persen,
        r.triwulan_1,
        r.triwulan_2,
        r.triwulan_3,
      ]),
    );
  });
}

export function generatePksPdf(data: DashboardPks): Promise<Buffer> {
  return render((doc) => {
    doc.fontSize(14).text(`Laporan PKS - ${data.tahun}`, { align: "center" });
    doc.moveDown();
    doc
      .fontSize(10)
      .text(`Grand Total JP PPM: ${data.grandTotal}`);
    doc.moveDown();
    table(
      doc,
      30,
      doc.y,
      [80, 100, 120, 120],
      ["Minggu", "JP", "Prev Total", "Cumulative"],
      data.weeks.map((w) => [
        w.week,
        w.jam,
        w.previousTotal,
        w.cumulative,
      ]),
    );
  });
}
