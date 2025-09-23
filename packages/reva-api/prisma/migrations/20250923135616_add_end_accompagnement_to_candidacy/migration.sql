-- CreateEnum
CREATE TYPE "EndAccompagnementStatus" AS ENUM ('NOT_REQUESTED', 'PENDING', 'CONFIRMED');

-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "end_accompagnement_date" TIMESTAMPTZ(6),
ADD COLUMN     "end_accompagnement_status" "EndAccompagnementStatus" NOT NULL DEFAULT 'NOT_REQUESTED';
