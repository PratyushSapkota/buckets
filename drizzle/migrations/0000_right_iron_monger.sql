CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit', 'transfer');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"bucket_id" uuid NOT NULL,
	"name" text NOT NULL,
	"closed_at" timestamp with time zone,
	CONSTRAINT "accounts_id_user_id_unique" UNIQUE("id","user_id")
);
--> statement-breakpoint
CREATE TABLE "buckets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"currency" text NOT NULL,
	"color" text,
	"closed_at" timestamp with time zone,
	CONSTRAINT "buckets_id_user_id_unique" UNIQUE("id","user_id")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color" text,
	CONSTRAINT "categories_id_user_id_unique" UNIQUE("id","user_id")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"description" text,
	"amount" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"category_id" uuid,
	"account_id" uuid NOT NULL,
	"transfer_account_id" uuid,
	"occurred_at" timestamp with time zone,
	CONSTRAINT "transactions_amount_positive_check" CHECK ("transactions"."amount" > 0),
	CONSTRAINT "transactions_transfer_fields_check" CHECK ((
        ("transactions"."type" = 'transfer' and "transactions"."transfer_account_id" is not null and "transactions"."transfer_account_id" <> "transactions"."account_id")
        or
        ("transactions"."type" in ('credit', 'debit') and "transactions"."transfer_account_id" is null)
      ))
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_bucket_owner_fk" FOREIGN KEY ("bucket_id","user_id") REFERENCES "public"."buckets"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_owner_fk" FOREIGN KEY ("category_id","user_id") REFERENCES "public"."categories"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_owner_fk" FOREIGN KEY ("account_id","user_id") REFERENCES "public"."accounts"("id","user_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_transfer_account_owner_fk" FOREIGN KEY ("transfer_account_id","user_id") REFERENCES "public"."accounts"("id","user_id") ON DELETE no action ON UPDATE no action;