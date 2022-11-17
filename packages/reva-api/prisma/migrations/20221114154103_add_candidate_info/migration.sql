/*
  Warnings:

  - You are about to drop the column `degree_id` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `vulnerability_indicator_id` on the `candidacy` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('man', 'undisclosed', 'woman');

-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_degree_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_vulnerability_indicator_id_fkey";

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "degree_id",
DROP COLUMN "vulnerability_indicator_id";

-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "firstname2" VARCHAR(255),
ADD COLUMN     "firstname3" VARCHAR(255),
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "highest_degree_id" UUID,
ADD COLUMN     "vulnerability_indicator_id" UUID;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_highest_degree_id_fkey" FOREIGN KEY ("highest_degree_id") REFERENCES "degree"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_vulnerability_indicator_id_fkey" FOREIGN KEY ("vulnerability_indicator_id") REFERENCES "vulnerability_indicator"("id") ON DELETE SET NULL ON UPDATE CASCADE;
