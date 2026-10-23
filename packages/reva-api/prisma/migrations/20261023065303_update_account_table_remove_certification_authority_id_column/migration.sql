/*
  Warnings:

  - You are about to drop the column `certification_authority_id` on the `account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_certification_authority_id_fkey";

-- DropIndex
DROP INDEX "account_certification_authority_id_idx";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "certification_authority_id",
ADD COLUMN     "certificationAuthorityId" UUID;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_certificationAuthorityId_fkey" FOREIGN KEY ("certificationAuthorityId") REFERENCES "certification_authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;
