/*
  Warnings:

  - You are about to drop the column `organism_id` on the `account` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "account" DROP CONSTRAINT "account_organism_id_fkey";

-- DropIndex
DROP INDEX "account_organism_id_idx";

-- AlterTable
ALTER TABLE "account" DROP COLUMN "organism_id",
ADD COLUMN     "organismId" UUID;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_organismId_fkey" FOREIGN KEY ("organismId") REFERENCES "organism"("id") ON DELETE SET NULL ON UPDATE CASCADE;
