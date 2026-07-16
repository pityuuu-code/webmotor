import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_sites_header_link_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_sites_footer_link_type" AS ENUM('page', 'custom');
  CREATE TYPE "public"."enum_sites_theme" AS ENUM('folyoirat', 'studio', 'magazin');
  CREATE TABLE "sites_domains" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"domain" varchar NOT NULL
  );
  
  CREATE TABLE "sites_header" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_sites_header_link_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "sites_footer" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_sites_footer_link_type" DEFAULT 'page',
  	"page_id" integer,
  	"url" varchar,
  	"new_tab" boolean DEFAULT false
  );
  
  CREATE TABLE "sites" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"site_name" varchar DEFAULT 'Webmotor' NOT NULL,
  	"tagline" varchar,
  	"logo_id" integer,
  	"theme" "enum_sites_theme" DEFAULT 'folyoirat' NOT NULL,
  	"footer_text" varchar,
  	"gtm_id" varchar,
  	"search_console_verification" varchar,
  	"socials_facebook" varchar,
  	"socials_instagram" varchar,
  	"socials_tiktok" varchar,
  	"socials_linkedin" varchar,
  	"socials_youtube" varchar,
  	"socials_whatsapp" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  DROP INDEX "categories_name_idx";
  DROP INDEX "articles_slug_idx";
  DROP INDEX "pages_slug_idx";
  DROP INDEX "categories_slug_idx";
  DROP INDEX "redirects_from_idx";
  ALTER TABLE "articles" ADD COLUMN "site_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_site_id" integer;
  ALTER TABLE "pages" ADD COLUMN "site_id" integer;
  ALTER TABLE "_pages_v" ADD COLUMN "version_site_id" integer;
  ALTER TABLE "categories" ADD COLUMN "site_id" integer;
  ALTER TABLE "redirects" ADD COLUMN "site_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "sites_id" integer;
  ALTER TABLE "sites_domains" ADD CONSTRAINT "sites_domains_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_header" ADD CONSTRAINT "sites_header_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_header" ADD CONSTRAINT "sites_header_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites_footer" ADD CONSTRAINT "sites_footer_page_id_pages_id_fk" FOREIGN KEY ("page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "sites_footer" ADD CONSTRAINT "sites_footer_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "sites" ADD CONSTRAINT "sites_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "sites_domains_order_idx" ON "sites_domains" USING btree ("_order");
  CREATE INDEX "sites_domains_parent_id_idx" ON "sites_domains" USING btree ("_parent_id");
  CREATE INDEX "sites_header_order_idx" ON "sites_header" USING btree ("_order");
  CREATE INDEX "sites_header_parent_id_idx" ON "sites_header" USING btree ("_parent_id");
  CREATE INDEX "sites_header_page_idx" ON "sites_header" USING btree ("page_id");
  CREATE INDEX "sites_footer_order_idx" ON "sites_footer" USING btree ("_order");
  CREATE INDEX "sites_footer_parent_id_idx" ON "sites_footer" USING btree ("_parent_id");
  CREATE INDEX "sites_footer_page_idx" ON "sites_footer" USING btree ("page_id");
  CREATE INDEX "sites_logo_idx" ON "sites" USING btree ("logo_id");
  CREATE INDEX "sites_updated_at_idx" ON "sites" USING btree ("updated_at");
  CREATE INDEX "sites_created_at_idx" ON "sites" USING btree ("created_at");
  ALTER TABLE "articles" ADD CONSTRAINT "articles_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_site_id_sites_id_fk" FOREIGN KEY ("version_site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "redirects" ADD CONSTRAINT "redirects_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_sites_fk" FOREIGN KEY ("sites_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_site_idx" ON "articles" USING btree ("site_id");
  CREATE INDEX "_articles_v_version_version_site_idx" ON "_articles_v" USING btree ("version_site_id");
  CREATE INDEX "pages_site_idx" ON "pages" USING btree ("site_id");
  CREATE INDEX "_pages_v_version_version_site_idx" ON "_pages_v" USING btree ("version_site_id");
  CREATE INDEX "categories_site_idx" ON "categories" USING btree ("site_id");
  CREATE INDEX "redirects_site_idx" ON "redirects" USING btree ("site_id");
  CREATE INDEX "payload_locked_documents_rels_sites_id_idx" ON "payload_locked_documents_rels" USING btree ("sites_id");
  CREATE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "sites_domains" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites_footer" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "sites" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "sites_domains" CASCADE;
  DROP TABLE "sites_header" CASCADE;
  DROP TABLE "sites_footer" CASCADE;
  DROP TABLE "sites" CASCADE;
  ALTER TABLE "articles" DROP CONSTRAINT "articles_site_id_sites_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_site_id_sites_id_fk";
  
  ALTER TABLE "pages" DROP CONSTRAINT "pages_site_id_sites_id_fk";
  
  ALTER TABLE "_pages_v" DROP CONSTRAINT "_pages_v_version_site_id_sites_id_fk";
  
  ALTER TABLE "categories" DROP CONSTRAINT "categories_site_id_sites_id_fk";
  
  ALTER TABLE "redirects" DROP CONSTRAINT "redirects_site_id_sites_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_sites_fk";
  
  DROP INDEX "articles_site_idx";
  DROP INDEX "_articles_v_version_version_site_idx";
  DROP INDEX "pages_site_idx";
  DROP INDEX "_pages_v_version_version_site_idx";
  DROP INDEX "categories_site_idx";
  DROP INDEX "redirects_site_idx";
  DROP INDEX "payload_locked_documents_rels_sites_id_idx";
  DROP INDEX "articles_slug_idx";
  DROP INDEX "pages_slug_idx";
  DROP INDEX "categories_slug_idx";
  DROP INDEX "redirects_from_idx";
  CREATE UNIQUE INDEX "categories_name_idx" ON "categories" USING btree ("name");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  ALTER TABLE "articles" DROP COLUMN "site_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_site_id";
  ALTER TABLE "pages" DROP COLUMN "site_id";
  ALTER TABLE "_pages_v" DROP COLUMN "version_site_id";
  ALTER TABLE "categories" DROP COLUMN "site_id";
  ALTER TABLE "redirects" DROP COLUMN "site_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "sites_id";
  DROP TYPE "public"."enum_sites_header_link_type";
  DROP TYPE "public"."enum_sites_footer_link_type";
  DROP TYPE "public"."enum_sites_theme";`)
}
