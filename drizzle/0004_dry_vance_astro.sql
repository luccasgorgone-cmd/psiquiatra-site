CREATE TABLE "clinical_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"date" timestamp DEFAULT now() NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patient_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"patient_id" text NOT NULL,
	"sender" text DEFAULT 'doctor' NOT NULL,
	"body" text NOT NULL,
	"read_by_patient" boolean DEFAULT false NOT NULL,
	"read_by_doctor" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"birth_date" text DEFAULT '' NOT NULL,
	"cpf" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"password" text,
	"notes" text DEFAULT '' NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "patients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "patient_id" text;--> statement-breakpoint
ALTER TABLE "clinical_sessions" ADD CONSTRAINT "clinical_sessions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_messages" ADD CONSTRAINT "patient_messages_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "clinical_sessions_patient_idx" ON "clinical_sessions" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "patient_messages_patient_idx" ON "patient_messages" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "appointments_patient_idx" ON "appointments" USING btree ("patient_id");