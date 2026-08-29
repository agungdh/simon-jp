CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"nip" text NOT NULL,
	"password" text NOT NULL,
	"nama" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" integer,
	"deleted_at" timestamp with time zone,
	"deleted_by" integer
);
--> statement-breakpoint
CREATE INDEX "users_uuid_idx" ON "users" USING hash ("uuid");--> statement-breakpoint
CREATE UNIQUE INDEX "users_nip_active_uniq" ON "users" USING btree ("nip") WHERE "users"."deleted_at" IS NULL;