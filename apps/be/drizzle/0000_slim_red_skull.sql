CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uuid" uuid DEFAULT gen_random_uuid() NOT NULL,
	"nip" text NOT NULL,
	"password" text NOT NULL,
	"nama" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_nip_unique" UNIQUE("nip")
);
--> statement-breakpoint
CREATE INDEX "users_uuid_idx" ON "users" USING hash ("uuid");