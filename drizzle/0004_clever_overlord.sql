CREATE TABLE "listing_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payload" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listing_drafts_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"listing_id" uuid NOT NULL,
	"url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "listings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"university_id" uuid NOT NULL,
	"seller_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"pickup_location_id" uuid,
	"type" text DEFAULT 'sell' NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price_kobo" integer,
	"condition" text,
	"contact_phone" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"embedding" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "listing_drafts" ADD CONSTRAINT "listing_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_listing_id_listings_id_fk" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_university_id_universities_id_fk" FOREIGN KEY ("university_id") REFERENCES "public"."universities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_users_id_fk" FOREIGN KEY ("seller_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listings" ADD CONSTRAINT "listings_pickup_location_id_pickup_locations_id_fk" FOREIGN KEY ("pickup_location_id") REFERENCES "public"."pickup_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "listing_images_listing_idx" ON "listing_images" USING btree ("listing_id","sort_order");--> statement-breakpoint
CREATE INDEX "listings_university_status_idx" ON "listings" USING btree ("university_id","status","created_at");--> statement-breakpoint
CREATE INDEX "listings_seller_idx" ON "listings" USING btree ("seller_id");--> statement-breakpoint
CREATE INDEX "listings_category_idx" ON "listings" USING btree ("category_id");