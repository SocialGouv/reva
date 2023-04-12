-- AlterTable
ALTER TABLE "funding_request" ADD COLUMN     "other_training_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "other_training_hour_count" INTEGER NOT NULL DEFAULT 0;
