ALTER TABLE "users" ADD COLUMN "trial_ends_at" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "subscription_status" TEXT NOT NULL DEFAULT 'TRIAL';
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" TEXT;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" TEXT;
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");
