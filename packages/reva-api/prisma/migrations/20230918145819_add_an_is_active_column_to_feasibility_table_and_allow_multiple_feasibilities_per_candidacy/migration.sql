-- AlterTable
ALTER TABLE "feasibility"
ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;
-- DropIndex
DROP INDEX "feasibility_candidacy_id_key";