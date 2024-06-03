-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "prerequisites_part_complete" BOOLEAN NOT NULL DEFAULT false;
