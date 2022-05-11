/*
  Warnings:

  - Changed the type of `duration` on the `experience` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ExperienceDuration" AS ENUM ('unknown', 'lessThanOneYear', 'betweenOneAndThreeYears', 'moreThanThreeYears', 'moreThanFiveYears', 'moreThanTenYears');

-- AlterTable
ALTER TABLE "experience" DROP COLUMN "duration",
ADD COLUMN     "duration" "ExperienceDuration" NOT NULL;
