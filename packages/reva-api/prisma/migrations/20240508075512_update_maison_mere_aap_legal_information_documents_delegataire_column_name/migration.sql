/*
  Warnings:

  - You are about to drop the column `delagataire` on the `maison_mere_aap_legal_information_documents` table. All the data in the column will be lost.
  - Made the column `path` on table `file` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `delegataire` to the `maison_mere_aap_legal_information_documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "file" ALTER COLUMN "path" SET NOT NULL,
ALTER COLUMN "path" DROP DEFAULT;

-- AlterTable
ALTER TABLE "maison_mere_aap_legal_information_documents" DROP COLUMN "delagataire",
ADD COLUMN     "delegataire" BOOLEAN NOT NULL;
