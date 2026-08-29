CREATE TYPE "tipe" AS ENUM ('pegawai', 'admin');
CREATE TYPE "status" AS ENUM ('aktif', 'non aktif');
CREATE TYPE "kategori_jabatan" AS ENUM ('struktural', 'fungsional auditor', 'fungsional tertentu');
CREATE TYPE "kategori_kebutuhan_jam_pelatihan" AS ENUM ('admin', 'pejabat', 'auditor');
--> statement-breakpoint
CREATE TABLE "belajar_mandiris" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "bidangs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"bidang" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "coachings" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "diklats" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"jenis_pelatihan_id" integer NOT NULL,
	"nomor_surat" text NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"dari_tanggal_pelaksanaan" date NOT NULL,
	"sampai_tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam_pelatihan" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "jenis_pelatihans" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"jenis_pelatihan" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "lcs" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "materi_ppms" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"nomor_surat" text,
	"nama_pemateri" text,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"link_materi" text,
	"link_dokumentasi" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "mentorings" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "pangkat_golongans" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"jenjang" text NOT NULL,
	"pangkat" text NOT NULL,
	"golongan" text NOT NULL,
	"ruang" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "ppms" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"nomor_surat" text NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam_pelatihan" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "seminars" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "webinars" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE TABLE "workshops" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"materi_pengembangan" text NOT NULL,
	"tanggal_pelaksanaan" date NOT NULL,
	"jumlah_jam" integer NOT NULL,
	"filename" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "bidang_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "pangkat_golongan_id" integer;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "tipe" "tipe" DEFAULT 'pegawai' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "status" "status" DEFAULT 'aktif' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "jabatan" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "peran" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kategori_jabatan" "kategori_jabatan";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "kategori_kebutuhan_jam_pelatihan" "kategori_kebutuhan_jam_pelatihan";--> statement-breakpoint
ALTER TABLE "belajar_mandiris" ADD CONSTRAINT "belajar_mandiris_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "coachings" ADD CONSTRAINT "coachings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diklats" ADD CONSTRAINT "diklats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "diklats" ADD CONSTRAINT "diklats_jenis_pelatihan_id_jenis_pelatihans_id_fk" FOREIGN KEY ("jenis_pelatihan_id") REFERENCES "public"."jenis_pelatihans"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lcs" ADD CONSTRAINT "lcs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorings" ADD CONSTRAINT "mentorings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ppms" ADD CONSTRAINT "ppms_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "seminars" ADD CONSTRAINT "seminars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webinars" ADD CONSTRAINT "webinars_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workshops" ADD CONSTRAINT "workshops_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "belajar_mandiris_uuid_idx" ON "belajar_mandiris" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "belajar_mandiris_tanggal_idx" ON "belajar_mandiris" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "bidangs_uuid_idx" ON "bidangs" USING hash ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "bidangs_bidang_active_uniq" ON "bidangs" USING btree ("bidang") WHERE "bidangs"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "coachings_uuid_idx" ON "coachings" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "coachings_tanggal_idx" ON "coachings" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "diklats_uuid_idx" ON "diklats" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "diklats_nomor_surat_idx" ON "diklats" USING btree ("nomor_surat");--> statement-breakpoint
CREATE INDEX "diklats_dari_idx" ON "diklats" USING btree ("dari_tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "diklats_sampai_idx" ON "diklats" USING btree ("sampai_tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "jenis_pelatihans_uuid_idx" ON "jenis_pelatihans" USING hash ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "jenis_pelatihans_jenis_active_uniq" ON "jenis_pelatihans" USING btree ("jenis_pelatihan") WHERE "jenis_pelatihans"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX "lcs_uuid_idx" ON "lcs" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "lcs_tanggal_idx" ON "lcs" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "materi_ppms_uuid_idx" ON "materi_ppms" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "materi_ppms_nomor_surat_idx" ON "materi_ppms" USING btree ("nomor_surat");--> statement-breakpoint
CREATE INDEX "materi_ppms_tanggal_idx" ON "materi_ppms" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "mentorings_uuid_idx" ON "mentorings" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "mentorings_tanggal_idx" ON "mentorings" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "pangkat_golongans_uuid_idx" ON "pangkat_golongans" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "ppms_uuid_idx" ON "ppms" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "ppms_nomor_surat_idx" ON "ppms" USING btree ("nomor_surat");--> statement-breakpoint
CREATE INDEX "ppms_tanggal_idx" ON "ppms" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "seminars_uuid_idx" ON "seminars" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "seminars_tanggal_idx" ON "seminars" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "webinars_uuid_idx" ON "webinars" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "webinars_tanggal_idx" ON "webinars" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
CREATE INDEX "workshops_uuid_idx" ON "workshops" USING hash ("uuid");--> statement-breakpoint
CREATE INDEX "workshops_tanggal_idx" ON "workshops" USING btree ("tanggal_pelaksanaan");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_bidang_id_bidangs_id_fk" FOREIGN KEY ("bidang_id") REFERENCES "public"."bidangs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_pangkat_golongan_id_pangkat_golongans_id_fk" FOREIGN KEY ("pangkat_golongan_id") REFERENCES "public"."pangkat_golongans"("id") ON DELETE no action ON UPDATE no action;