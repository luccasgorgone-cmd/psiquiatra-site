CREATE TABLE "appointment_labels" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"color" text DEFAULT '#A9814E' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "label_id" text;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "kind" text DEFAULT 'consulta' NOT NULL;--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "title" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "favicon_id" text;