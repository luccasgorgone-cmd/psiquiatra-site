CREATE TABLE "credentials" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"org" text NOT NULL,
	"period" text DEFAULT '' NOT NULL,
	"detail" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT 'graduation' NOT NULL,
	"order" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL
);
