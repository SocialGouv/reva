/*
  Warnings:

  - Made the column `companion_id` on table `candidacy` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_companion_id_fkey";

-- AlterTable
ALTER TABLE "candidacy" ALTER COLUMN "companion_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "goal" ADD COLUMN     "needs_additional_information" BOOLEAN NOT NULL DEFAULT false;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_companion_id_fkey" FOREIGN KEY ("companion_id") REFERENCES "companion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
