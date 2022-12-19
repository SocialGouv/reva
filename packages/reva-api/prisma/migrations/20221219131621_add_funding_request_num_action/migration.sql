-- AlterTable
ALTER TABLE "funding_request"
ADD COLUMN "num_action" TEXT NOT NULL DEFAULT E'TO_MIGRATE';
ALTER SEQUENCE "funding_request_batch_num_action_sequence"
RENAME TO "funding_request_num_action_sequence"