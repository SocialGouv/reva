-- CreateEnum
CREATE TYPE "CompetenceBlocsPartCompletionEnum" AS ENUM ('TO_COMPLETE', 'COMPLETED', 'IN_PROGRESS');

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "competence_blocs_part_completion" "CompetenceBlocsPartCompletionEnum" NOT NULL DEFAULT 'TO_COMPLETE';
