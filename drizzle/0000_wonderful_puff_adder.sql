CREATE TABLE "auth_identities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"provider_user_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"faculty_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "faculties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pickup_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reserved_usernames" (
	"username" text PRIMARY KEY NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "universities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"short_name" text NOT NULL,
	"city" text NOT NULL,
	"state" text NOT NULL,
	"domain" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "universities_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"faculty_id" uuid,
	"department_id" uuid,
	"username" text NOT NULL,
	"display_name" text NOT NULL,
	"email" text,
	"phone" text,
	"avatar_url" text,
	"bio" text,
	"is_verified" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"is_banned" boolean DEFAULT false NOT NULL,
	"onboarding_completed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "auth_identities" ADD CONSTRAINT "auth_identities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "faculties" ADD CONSTRAINT "faculties_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pickup_locations" ADD CONSTRAINT "pickup_locations_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_faculty_id_faculties_id_fk" FOREIGN KEY ("faculty_id") REFERENCES "public"."faculties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_identities_provider_idx" ON "auth_identities" USING btree ("provider","provider_user_id");--> statement-breakpoint
CREATE INDEX "auth_identities_user_idx" ON "auth_identities" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "departments_faculty_slug_idx" ON "departments" USING btree ("faculty_id","slug");--> statement-breakpoint
CREATE UNIQUE INDEX "faculties_university_slug_idx" ON "faculties" USING btree ("university_id","slug");--> statement-breakpoint
CREATE INDEX "pickup_locations_university_idx" ON "pickup_locations" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "users_university_idx" ON "users" USING btree ("university_id");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");