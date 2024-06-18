/*
  Warnings:

  - The values [OTHER] on the enum `DFFAttachmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "DFFAttachmentType_new" AS ENUM ('ID_CARD', 'EQUIVALENCE_OR_EXEMPTION_PROOF', 'TRAINING_CERTIFICATE', 'ADDITIONAL');
ALTER TABLE "dff_attachment" ALTER COLUMN "type" TYPE "DFFAttachmentType_new" USING ("type"::text::"DFFAttachmentType_new");
ALTER TYPE "DFFAttachmentType" RENAME TO "DFFAttachmentType_old";
ALTER TYPE "DFFAttachmentType_new" RENAME TO "DFFAttachmentType";
DROP TYPE "DFFAttachmentType_old";
COMMIT;
