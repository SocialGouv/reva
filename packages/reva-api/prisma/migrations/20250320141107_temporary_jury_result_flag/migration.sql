-- AlterTable
ALTER TABLE "jury" ADD COLUMN "is_result_temporary" BOOLEAN;
-- Set default values
UPDATE "jury" SET "is_result_temporary" = false WHERE result IS NOT NULL AND result <> '' AND result <> 'PARTIAL_SUCCESS_PENDING_CONFIRMATION';
UPDATE "jury" SET "is_result_temporary" = true WHERE result = 'PARTIAL_SUCCESS_PENDING_CONFIRMATION';