-- CreateEnum
CREATE TYPE "AppointmentDuration" AS ENUM (
    'HALF_AN_HOUR',
    'ONE_HOUR',
    'TWO_HOURS',
    'THREE_HOURS',
    'FOUR_HOURS'
);

-- AlterTable
ALTER TABLE "appointment"
ADD COLUMN "duration" "AppointmentDuration";