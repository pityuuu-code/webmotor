import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_forms_fields_field_type" AS ENUM('text', 'email', 'textarea', 'select', 'checkbox');
  CREATE TABLE "forms_fields" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"field_type" "enum_forms_fields_field_type" DEFAULT 'text' NOT NULL,
  	"required" boolean DEFAULT false,
  	"options" varchar
  );
  
  CREATE TABLE "forms" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"submit_label" varchar DEFAULT 'Küldés',
  	"success_message" varchar DEFAULT 'Köszönjük! Hamarosan válaszolunk.',
  	"notify_emails" varchar,
  	"site_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "form_submissions" ALTER COLUMN "name" DROP NOT NULL;
  ALTER TABLE "form_submissions" ALTER COLUMN "email" DROP NOT NULL;
  ALTER TABLE "form_submissions" ALTER COLUMN "message" DROP NOT NULL;
  ALTER TABLE "form_submissions" ADD COLUMN "data" jsonb;
  ALTER TABLE "form_submissions" ADD COLUMN "form_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "forms_id" integer;
  ALTER TABLE "forms_fields" ADD CONSTRAINT "forms_fields_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "forms" ADD CONSTRAINT "forms_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "forms_fields_order_idx" ON "forms_fields" USING btree ("_order");
  CREATE INDEX "forms_fields_parent_id_idx" ON "forms_fields" USING btree ("_parent_id");
  CREATE INDEX "forms_site_idx" ON "forms" USING btree ("site_id");
  CREATE INDEX "forms_updated_at_idx" ON "forms" USING btree ("updated_at");
  CREATE INDEX "forms_created_at_idx" ON "forms" USING btree ("created_at");
  ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_forms_fk" FOREIGN KEY ("forms_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "form_submissions_form_idx" ON "form_submissions" USING btree ("form_id");
  CREATE INDEX "payload_locked_documents_rels_forms_id_idx" ON "payload_locked_documents_rels" USING btree ("forms_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "forms_fields" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "forms" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "forms_fields" CASCADE;
  DROP TABLE "forms" CASCADE;
  ALTER TABLE "form_submissions" DROP CONSTRAINT "form_submissions_form_id_forms_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_forms_fk";
  
  DROP INDEX "form_submissions_form_idx";
  DROP INDEX "payload_locked_documents_rels_forms_id_idx";
  ALTER TABLE "form_submissions" ALTER COLUMN "name" SET NOT NULL;
  ALTER TABLE "form_submissions" ALTER COLUMN "email" SET NOT NULL;
  ALTER TABLE "form_submissions" ALTER COLUMN "message" SET NOT NULL;
  ALTER TABLE "form_submissions" DROP COLUMN "data";
  ALTER TABLE "form_submissions" DROP COLUMN "form_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "forms_id";
  DROP TYPE "public"."enum_forms_fields_field_type";`)
}
