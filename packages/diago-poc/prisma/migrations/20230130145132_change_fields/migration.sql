/*
  Warnings:

  - The primary key for the `competency_rome` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `competence_id` on the `competency_rome` table. All the data in the column will be lost.
  - Added the required column `competence_code_ogr` to the `competency_rome` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "competency_rome" DROP CONSTRAINT "competency_rome_competence_id_fkey";

-- AlterTable
ALTER TABLE "competency_rome" DROP CONSTRAINT "competency_rome_pkey",
DROP COLUMN "competence_id",
ADD COLUMN     "competence_code_ogr" TEXT NOT NULL,
ADD CONSTRAINT "competency_rome_pkey" PRIMARY KEY ("competence_code_ogr", "rome_code");

-- AddForeignKey
ALTER TABLE "competency_rome" ADD CONSTRAINT "competency_rome_competence_code_ogr_fkey" FOREIGN KEY ("competence_code_ogr") REFERENCES "competency"("code_ogr") ON DELETE RESTRICT ON UPDATE CASCADE;
