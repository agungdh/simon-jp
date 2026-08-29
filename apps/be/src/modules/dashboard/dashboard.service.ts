import { db } from "../../db";
import { and, eq, isNull, sql } from "drizzle-orm";
import { HttpError } from "../../plugins/error";
import { diklats } from "../diklat/diklat.entity";
import { ppms } from "../ppm/ppm.entity";
import { seminars } from "../seminar/seminar.entity";
import { webinars } from "../webinar/webinar.entity";
import { lcs } from "../lc/lc.entity";
import { users } from "../user/user.entity";

const COUNTED_MODULES = [
  { name: "diklat", table: diklats, jam: "jumlahJamPelatihan", date: "dariTanggalPelaksanaan" },
  { name: "ppm", table: ppms, jam: "jumlahJamPelatihan", date: "tanggalPelaksanaan" },
  { name: "seminar", table: seminars, jam: "jumlahJam", date: "tanggalPelaksanaan" },
  { name: "webinar", table: webinars, jam: "jumlahJam", date: "tanggalPelaksanaan" },
  { name: "lc", table: lcs, jam: "jumlahJam", date: "tanggalPelaksanaan" },
] as const;

function minimalFor(kategori: string | null): number {
  if (kategori === "admin") return 20;
  if (kategori === "pejabat" || kategori === "auditor") return 40;
  return 0;
}

async function getUserInfo(userUuid: string) {
  const [row] = await db
    .select({
      id: users.id,
      uuid: users.uuid,
      nip: users.nip,
      nama: users.nama,
      kategori: users.kategoriKebutuhanJamPelatihan,
      status: users.status,
    })
    .from(users)
    .where(and(eq(users.uuid, userUuid), isNull(users.deletedAt)))
    .limit(1);
  if (!row) throw new HttpError(404, "Pegawai tidak ditemukan");
  return row;
}

async function moduleAggregate(
  table: any,
  jamCol: string,
  dateCol: string,
  userId: number,
  year: number,
) {
  const jam = (table as any)[jamCol];
  const date = (table as any)[dateCol];
  const [row] = await db
    .select({
      total: sql`COALESCE(SUM(${jam}), 0)`,
      q1: sql`COALESCE(SUM(CASE WHEN EXTRACT(QUARTER FROM ${date}) = 1 THEN ${jam} END), 0)`,
      q2: sql`COALESCE(SUM(CASE WHEN EXTRACT(QUARTER FROM ${date}) = 2 THEN ${jam} END), 0)`,
      q3: sql`COALESCE(SUM(CASE WHEN EXTRACT(QUARTER FROM ${date}) = 3 THEN ${jam} END), 0)`,
      q4: sql`COALESCE(SUM(CASE WHEN EXTRACT(QUARTER FROM ${date}) = 4 THEN ${jam} END), 0)`,
    })
    .from(table)
    .where(
      and(
        eq((table as any).userId, userId),
        sql`EXTRACT(YEAR FROM ${date}) = ${year}`,
        isNull((table as any).deletedAt),
      ),
    );
  return {
    total: Number(row?.total ?? 0),
    q1: Number(row?.q1 ?? 0),
    q2: Number(row?.q2 ?? 0),
    q3: Number(row?.q3 ?? 0),
    q4: Number(row?.q4 ?? 0),
  };
}

async function moduleItems(
  table: any,
  jamCol: string,
  dateCol: string,
  modul: string,
  userId: number,
  year: number,
) {
  const jam = (table as any)[jamCol];
  const date = (table as any)[dateCol];
  const rows = await db
    .select({
      modul: sql`${modul}`,
      materi: (table as any).materiPengembangan,
      tanggal: date,
      jam: jam,
    })
    .from(table)
    .where(
      and(
        eq((table as any).userId, userId),
        sql`EXTRACT(YEAR FROM ${date}) = ${year}`,
        isNull((table as any).deletedAt),
      ),
    );
  return rows.map((r: any) => ({
    modul,
    materi: r.materi,
    tanggal: r.tanggal,
    jam: Number(r.jam),
  }));
}

async function aggregateUser(userId: number, year: number) {
  let capaian = 0;
  const triwulan = [0, 0, 0, 0];
  const detailCapaian: Record<string, number> = {};
  for (const m of COUNTED_MODULES) {
    const agg = await moduleAggregate(
      m.table,
      m.jam,
      m.date,
      userId,
      year,
    );
    capaian += agg.total;
    triwulan[0] += agg.q1;
    triwulan[1] += agg.q2;
    triwulan[2] += agg.q3;
    triwulan[3] += agg.q4;
    detailCapaian[m.name] = agg.total;
  }
  return { capaian, triwulan, detailCapaian };
}

export const dashboardService = {
  async computePegawai(userUuid: string, year: number) {
    const user = await getUserInfo(userUuid);
    const { capaian, triwulan, detailCapaian } = await aggregateUser(
      user.id,
      year,
    );
    const minimal = minimalFor(user.kategori);
    const persen = minimal > 0 ? Math.round((capaian / minimal) * 100) : 0;

    const detailItems: any[] = [];
    for (const m of COUNTED_MODULES) {
      const items = await moduleItems(
        m.table,
        m.jam,
        m.date,
        m.name,
        user.id,
        year,
      );
      detailItems.push(...items);
    }
    detailItems.sort(
      (a, b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime(),
    );

    return {
      uuid: user.uuid,
      nip: user.nip,
      nama: user.nama,
      kategori: user.kategori,
      tahun: year,
      jumlahMinimal: minimal,
      jumlahCapaian: capaian,
      persen,
      triwulan_1: triwulan[0],
      triwulan_2: triwulan[1],
      triwulan_3: triwulan[2],
      triwulan_4: triwulan[3],
      detailCapaian,
      detailItems,
    };
  },

  async adminList(year: number) {
    const pegawai = await db
      .select({
        id: users.id,
        uuid: users.uuid,
        nip: users.nip,
        nama: users.nama,
        kategori: users.kategoriKebutuhanJamPelatihan,
      })
      .from(users)
      .where(and(eq(users.status, "aktif"), isNull(users.deletedAt)))
      .orderBy(users.nip);

    const rows = [];
    for (const p of pegawai) {
      const { capaian, triwulan } = await aggregateUser(p.id, year);
      const minimal = minimalFor(p.kategori);
      const persen = minimal > 0 ? Math.round((capaian / minimal) * 100) : 0;
      rows.push({
        uuid: p.uuid,
        nip: p.nip,
        nama: p.nama,
        kategori: p.kategori,
        jumlahMinimal: minimal,
        jumlahCapaian: capaian,
        persen,
        triwulan_1: triwulan[0],
        triwulan_2: triwulan[1],
        triwulan_3: triwulan[2],
        triwulan_4: triwulan[3],
      });
    }
    return rows;
  },

  async pks(year: number) {
    const rows = (await db
      .select({
        week: sql`EXTRACT(WEEK FROM tanggal_pelaksanaan)`,
        jam: sql`COALESCE(SUM(jumlah_jam_pelatihan), 0)`,
      })
      .from(ppms)
      .where(
        and(
          sql`EXTRACT(YEAR FROM tanggal_pelaksanaan) = ${year}`,
          isNull(ppms.deletedAt),
        ),
      )
      .groupBy(sql`EXTRACT(WEEK FROM tanggal_pelaksanaan)`)
      .orderBy(sql`EXTRACT(WEEK FROM tanggal_pelaksanaan)`)) as any[];

    let cumulative = 0;
    let grandTotal = 0;
    const weeks = rows.map((r: any) => {
      const jam = Number(r.jam);
      cumulative += jam;
      grandTotal += jam;
      return {
        week: Number(r.week),
        jam,
        previousTotal: cumulative - jam,
        cumulative,
      };
    });

    return { tahun: year, weeks, grandTotal };
  },
};

export type DashboardPegawai = Awaited<
  ReturnType<typeof dashboardService.computePegawai>
>;
export type DashboardAdminRow = Awaited<
  ReturnType<typeof dashboardService.adminList>
>[number];
export type DashboardPks = Awaited<ReturnType<typeof dashboardService.pks>>;
