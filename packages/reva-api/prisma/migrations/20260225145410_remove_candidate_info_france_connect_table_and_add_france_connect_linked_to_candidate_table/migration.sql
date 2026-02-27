/*
  Warnings:

  - You are about to drop the `candidate_info_france_connect` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "candidate_info_france_connect" DROP CONSTRAINT "candidate_info_france_connect_candidate_id_fkey";

-- DropForeignKey
ALTER TABLE "candidate_info_france_connect" DROP CONSTRAINT "candidate_info_france_connect_country_id_fkey";

-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "france_connect_linked" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "candidate_info_france_connect";
