/*
  Warnings:

  - You are about to drop the column `certification_authority_local_account_id` on the `certification_authority_log` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_authority_log" DROP CONSTRAINT "certification_authority_log_certification_authority_local__fkey";

-- DropIndex
DROP INDEX "certification_authority_log_certification_authority_local_a_idx";

-- AlterTable
ALTER TABLE "certification_authority_log" DROP COLUMN "certification_authority_local_account_id",
ADD COLUMN     "certificationAuthorityLocalAccountId" UUID;

-- AddForeignKey
ALTER TABLE "certification_authority_log" ADD CONSTRAINT "certification_authority_log_certificationAuthorityLocalAcc_fkey" FOREIGN KEY ("certificationAuthorityLocalAccountId") REFERENCES "certification_authority_local_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
