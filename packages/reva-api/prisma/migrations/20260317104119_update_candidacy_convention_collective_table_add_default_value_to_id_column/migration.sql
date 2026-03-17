-- AlterTable
ALTER TABLE "candidacy_convention_collective"
ALTER COLUMN "id"
SET DEFAULT uuid_generate_v4 ();