-- AlterTable
ALTER TABLE "subscription_request"
ADD COLUMN "qualiopi_certificate_expires_at" TIMESTAMP(3) DEFAULT timestamp '2023-01-01';
ALTER TABLE "subscription_request"
ALTER COLUMN "qualiopi_certificate_expires_at" DROP DEFAULT;
ALTER TABLE "subscription_request"
ALTER COLUMN "qualiopi_certificate_expires_at"
SET NOT NULL;