import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "not_found_log" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"path" varchar NOT NULL,
  	"count" numeric DEFAULT 1,
  	"last_seen_at" timestamp(3) with time zone,
  	"site_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "not_found_log_id" integer;
  ALTER TABLE "not_found_log" ADD CONSTRAINT "not_found_log_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "not_found_log_path_idx" ON "not_found_log" USING btree ("path");
  CREATE INDEX "not_found_log_site_idx" ON "not_found_log" USING btree ("site_id");
  CREATE INDEX "not_found_log_updated_at_idx" ON "not_found_log" USING btree ("updated_at");
  CREATE INDEX "not_found_log_created_at_idx" ON "not_found_log" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_not_found_log_fk" FOREIGN KEY ("not_found_log_id") REFERENCES "public"."not_found_log"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_not_found_log_id_idx" ON "payload_locked_documents_rels" USING btree ("not_found_log_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "not_found_log" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "not_found_log" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_not_found_log_fk";
  
  DROP INDEX "payload_locked_documents_rels_not_found_log_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "not_found_log_id";`)
}
