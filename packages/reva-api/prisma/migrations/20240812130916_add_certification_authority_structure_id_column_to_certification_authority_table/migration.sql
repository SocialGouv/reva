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

ALTER TABLE "certification_authority"
ALTER COLUMN "certification_authority_structure_id"
SET
  NOT NULL;

-- delete certifications from certification authorities not associated with their structure
DELETE FROM "certification_authority_on_certification"
WHERE
  "certification_authority_on_certification"."certification_id" NOT IN (
    SELECT
      "certification"."id"
    FROM
      "certification"
      JOIN "certification_authority" on "certification_authority"."certification_authority_structure_id" = "certification"."certification_authority_structure_id"
    WHERE
      "certification_authority"."id" = "certification_authority_on_certification"."certification_authority_id"
  );

-- delete certifications from certification authority local accounts not associated with their certification authority
DELETE FROM "certification_authority_local_account_on_certification"
WHERE
  "certification_authority_local_account_on_certification"."certification_id" NOT IN (
    SELECT
      "certification_authority_on_certification"."certification_id"
    FROM
      "certification_authority_on_certification"
      JOIN "certification_authority" ON "certification_authority"."id" = "certification_authority_on_certification"."certification_authority_id"
      JOIN "certification_authority_local_account" ON "certification_authority_local_account"."certification_authority_id" = "certification_authority"."id"
    WHERE
      "certification_authority_local_account"."id" = "certification_authority_local_account_on_certification"."certification_authority_local_account_id"
  );