-- AlterTable
ALTER TABLE "candidacy"
ADD COLUMN "certification_id" UUID;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE "candidacy"
SET
    "certification_id" = (
        SELECT
            "certification_id"
        FROM
            "candidacy_region_certification"
        WHERE
            "candidacy_id" = "candidacy"."id"
            AND "candidacy_region_certification"."is_active" = 'true'
        LIMIT
            1
    )