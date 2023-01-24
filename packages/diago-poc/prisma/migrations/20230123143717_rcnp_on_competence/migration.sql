/*
  Warnings:

  - You are about to drop the column `certification_id` on the `competency` table. All the data in the column will be lost.
  - Added the required column `certification_rncp_id` to the `competency` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "competency" DROP CONSTRAINT "competency_certification_id_fkey";

-- AlterTable
ALTER TABLE "competency" DROP COLUMN "certification_id",
ADD COLUMN     "certification_rncp_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "competency" ADD CONSTRAINT "competency_certification_rncp_id_fkey" FOREIGN KEY ("certification_rncp_id") REFERENCES "certification"("rncp_id") ON DELETE RESTRICT ON UPDATE CASCADE;
