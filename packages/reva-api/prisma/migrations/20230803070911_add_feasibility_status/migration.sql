-- CreateEnum
CREATE TYPE "FeasibilityStatus" AS ENUM ('PENDING', 'REJECTED', 'ADMISSIBLE');


-- AlterTable
ALTER TABLE "feasibility" ADD COLUMN     "status" "FeasibilityStatus" NOT NULL DEFAULT 'PENDING';

