/*
Warnings:

- Added the required column `certification_authority_structure_id` to the `certification_authority` table without a default value. This is not possible if the table is not empty.

 */
-- AlterTable
ALTER TABLE "certification_authority"
ADD COLUMN "certification_authority_structure_id" UUID;

-- AddForeignKey
ALTER TABLE "certification_authority" ADD CONSTRAINT "certification_authority_certification_authority_structure__fkey" FOREIGN KEY ("certification_authority_structure_id") REFERENCES "certification_authority_structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

UPDATE "certification_authority"
SET
  "certification_authority_structure_id" = (
    SELECT
      "certification"."certification_authority_structure_id"
    FROM
      "certification_authority_on_certification"
      JOIN "certification" ON "certification"."id" = "certification_authority_on_certification"."certification_id"
    WHERE
      "certification_authority_on_certification"."certification_authority_id" = "certification_authority"."id"
    LIMIT
      1
  );

UPDATE "certification_authority"
SET
  "certification_authority_structure_id" = (
    SELECT
      id
    from
      "certification_authority_structure"
    where
      "label" = 'Structure certificatrice inconnue'
  )
WHERE
  "certification_authority_structure_id" is null;

ALTER TABLE "certification_authority"
ALTER COLUMN "certification_authority_structure_id"
SET
  NOT NULL;