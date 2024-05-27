-- AlterTable
ALTER TABLE "subscription_request_v2" ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "status" "SubscriptionRequestStatus" NOT NULL DEFAULT 'PENDING';
