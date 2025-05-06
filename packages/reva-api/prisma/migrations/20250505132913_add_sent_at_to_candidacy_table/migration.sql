-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "sent_at" TIMESTAMPTZ(6);

UPDATE "candidacy" SET "sent_at" = "candidacy_status"."created_at"
FROM (
    SELECT distinct on (candidacy_id) candidacy_id, created_at
    FROM "candidacy_candidacy_status"
    WHERE "candidacy_candidacy_status"."status" = 'VALIDATION'
    ORDER BY candidacy_id, "candidacy_candidacy_status"."created_at" DESC
) candidacy_status
WHERE "candidacy_status"."candidacy_id" = "candidacy"."id";
