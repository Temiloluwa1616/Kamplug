DROP INDEX "users_username_idx";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "university_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "username" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "access_token" text;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "refresh_token" text;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "id_token" text;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "access_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "refresh_token_expires_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "scope" text;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "password" text;--> statement-breakpoint
ALTER TABLE "auth_identities" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_onboarded_needs_profile" CHECK ("users"."onboarding_completed" = false OR ("users"."username" IS NOT NULL AND "users"."university_id" IS NOT NULL));