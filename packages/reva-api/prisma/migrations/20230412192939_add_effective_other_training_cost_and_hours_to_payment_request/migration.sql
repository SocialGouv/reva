-- AlterTable
ALTER TABLE "payment_request" ADD COLUMN     "other_training_effective_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "other_training_effective_hour_count" INTEGER NOT NULL DEFAULT 0;
