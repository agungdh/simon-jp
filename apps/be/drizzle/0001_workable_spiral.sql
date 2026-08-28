ALTER TABLE "users" ADD COLUMN "uuid" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE INDEX "users_uuid_idx" ON "users" USING hash ("uuid");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_uuid_unique" UNIQUE("uuid");