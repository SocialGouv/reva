-- CreateEnum
CREATE TYPE "FeasibilityFormat" AS ENUM ('UPLOADED_PDF', 'DEMATERIALIZED');

ALTER TABLE "candidacy" ADD COLUMN     "feasibility_format" "FeasibilityFormat" NOT NULL DEFAULT 'UPLOADED_PDF';
