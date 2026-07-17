import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "site_id" integer;
  ALTER TABLE "form_submissions" ADD COLUMN "site_id" integer;
  ALTER TABLE "media" ADD CONSTRAINT "media_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_site_idx" ON "media" USING btree ("site_id");
  CREATE INDEX "form_submissions_site_idx" ON "form_submissions" USING btree ("site_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" DROP CONSTRAINT "media_site_id_sites_id_fk";
  
  ALTER TABLE "form_submissions" DROP CONSTRAINT "form_submissions_site_id_sites_id_fk";
  
  DROP INDEX "media_site_idx";
  DROP INDEX "form_submissions_site_idx";
  ALTER TABLE "media" DROP COLUMN "site_id";
  ALTER TABLE "form_submissions" DROP COLUMN "site_id";`)
}
