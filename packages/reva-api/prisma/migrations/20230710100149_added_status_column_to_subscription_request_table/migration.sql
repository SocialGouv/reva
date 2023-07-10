-- CreateEnum
CREATE TYPE "SubscriptionRequestStatus" AS ENUM ('PENDING', 'REJECTED');
-- AlterTable
ALTER TABLE "subscription_request"
ADD COLUMN "status" "SubscriptionRequestStatus" NOT NULL DEFAULT 'PENDING';