CREATE TYPE "public"."appointment_channel" AS ENUM('SITE', 'WHATSAPP');--> statement-breakpoint
CREATE TYPE "public"."appointment_status" AS ENUM('PENDENTE', 'CONFIRMADO', 'CANCELADO', 'CONCLUIDO');--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "agent_config" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"channel_site" boolean DEFAULT true NOT NULL,
	"channel_whats" boolean DEFAULT false NOT NULL,
	"greeting" text DEFAULT 'Olá! 👋 Como posso ajudar você hoje?' NOT NULL,
	"fallback" text DEFAULT '' NOT NULL,
	"faq" json DEFAULT '[]'::json NOT NULL,
	"ai_enabled" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"channel" text NOT NULL,
	"from" text DEFAULT '' NOT NULL,
	"text" text NOT NULL,
	"reply" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"status" "appointment_status" DEFAULT 'PENDENTE' NOT NULL,
	"channel" "appointment_channel" DEFAULT 'SITE' NOT NULL,
	"mode" text DEFAULT 'presencial' NOT NULL,
	"notes" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "availability_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"weekday" integer NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"slot_min" integer DEFAULT 50 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blocked_slots" (
	"id" text PRIMARY KEY NOT NULL,
	"start" timestamp NOT NULL,
	"end" timestamp NOT NULL,
	"reason" text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_info" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"title" text DEFAULT 'A Clínica' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"amenities" json DEFAULT '[]'::json NOT NULL,
	"hours" text DEFAULT 'Segunda a sexta, 9h às 18h' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clinic_photos" (
	"id" text PRIMARY KEY NOT NULL,
	"media_id" text NOT NULL,
	"caption" text DEFAULT '' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "doctor" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"name" text DEFAULT 'Dra. Nome Sobrenome' NOT NULL,
	"crm" text DEFAULT 'CRM/UF 000000' NOT NULL,
	"rqe" text DEFAULT 'RQE 00000' NOT NULL,
	"title" text DEFAULT 'Médica Psiquiatra' NOT NULL,
	"bio_long" text DEFAULT '' NOT NULL,
	"approach" text DEFAULT '' NOT NULL,
	"formation" text DEFAULT '' NOT NULL,
	"photo_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "help_signs" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" text PRIMARY KEY NOT NULL,
	"mime" text NOT NULL,
	"data" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'main' NOT NULL,
	"site_name" text DEFAULT 'Clínica' NOT NULL,
	"tagline" text DEFAULT '' NOT NULL,
	"logo_id" text,
	"brand_rgb" text DEFAULT '70 90 82' NOT NULL,
	"brand_soft_rgb" text DEFAULT '120 140 130' NOT NULL,
	"brand_deep_rgb" text DEFAULT '40 54 48' NOT NULL,
	"hero_image_id" text,
	"hero_kicker" text DEFAULT 'Psiquiatria' NOT NULL,
	"hero_title" text DEFAULT 'Cuide sempre da sua saúde mental' NOT NULL,
	"hero_subtitle" text DEFAULT '' NOT NULL,
	"nav_items" json DEFAULT '[]'::json NOT NULL,
	"footer_text" text DEFAULT '' NOT NULL,
	"footer_note" text DEFAULT '' NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"facebook" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"address_line" text DEFAULT '' NOT NULL,
	"maps_embed" text DEFAULT '' NOT NULL,
	"meta_title" text DEFAULT '' NOT NULL,
	"meta_description" text DEFAULT '' NOT NULL,
	"og_image_id" text,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "specialties" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"icon" text DEFAULT 'brain' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX "appointments_start_idx" ON "appointments" USING btree ("start");