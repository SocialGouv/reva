/*
Warnings:

- A unique constraint covering the columns `[certification_authority_structure_id]` on the table `certification` will be added. If there are existing duplicate values, this will fail.
- Added the required column `certification_authority_structure_id` to the `certification` table without a default value. This is not possible if the table is not empty.

 */
-- AlterTable
ALTER TABLE "certification"
ADD COLUMN "certification_authority_structure_id" UUID;

-- CreateTable
CREATE TABLE
  "certification_authority_structure" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4 (),
    "label" VARCHAR(200) NOT NULL,
    CONSTRAINT "certification_authority_structure_pkey" PRIMARY KEY ("id")
  );

-- AddForeignKey
ALTER TABLE "certification" ADD CONSTRAINT "certification_certification_authority_structure_id_fkey" FOREIGN KEY ("certification_authority_structure_id") REFERENCES "certification_authority_structure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE UNIQUE INDEX "certification_authority_structure_label_key" ON "certification_authority_structure" ("label");

INSERT INTO
  "certification_authority_structure" ("label")
SELECT DISTINCT
  "certification_authority_tag"
FROM
  certification
WHERE
  certification_authority_tag <> '';

INSERT INTO
  certification_authority_structure (label)
VALUES
  ('Structure certificatrice inconnue');

UPDATE "certification"
SET
  certification_authority_tag = 'Structure certificatrice inconnue'
WHERE
  certification_authority_tag = ''
  OR certification_authority_tag IS NULL;

UPDATE "certification"
SET
  certification_authority_structure_id = (
    SELECT
      certification_authority_structure.id
    FROM
      certification_authority_structure
    WHERE
      certification_authority_structure.label = certification.certification_authority_tag
  );

ALTER TABLE "certification"
ALTER COLUMN "certification_authority_structure_id"
SET
  NOT NULL;