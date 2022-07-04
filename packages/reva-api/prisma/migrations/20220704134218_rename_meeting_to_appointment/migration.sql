/*
  Warnings:

  - You are about to drop the column `first_appointment_at` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `number_of_appointment` on the `candidacy` table. All the data in the column will be lost.
  - You are about to drop the column `was_present_at_appointment` on the `candidacy` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "first_appointment_at",
DROP COLUMN "number_of_appointment",
DROP COLUMN "was_present_at_appointment",
ADD COLUMN     "appointment_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "first_appointment_occured_at" TIMESTAMPTZ(6),
ADD COLUMN     "was_present_at_first_appointment" BOOLEAN;
