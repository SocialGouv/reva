-- CreateEnum
CREATE TYPE "PrerequisiteState" AS ENUM ('ACQUIRED', 'IN_PROGRESS', 'RECOMMENDED');

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "prerequisites_part_complete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "dff_prerequisite" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" TEXT NOT NULL,
    "state" "PrerequisiteState" NOT NULL,
    "dematerializedFeasibilityFileId" UUID,

    CONSTRAINT "dff_prerequisite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dff_prerequisite" ADD CONSTRAINT "dff_prerequisite_dematerializedFeasibilityFileId_fkey" FOREIGN KEY ("dematerializedFeasibilityFileId") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
