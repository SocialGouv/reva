-- AlterTable
ALTER TABLE "funding_request_batch_unifvae"
ADD COLUMN "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;