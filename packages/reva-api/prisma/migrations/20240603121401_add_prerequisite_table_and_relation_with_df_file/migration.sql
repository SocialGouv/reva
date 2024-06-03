-- CreateEnum
CREATE TYPE "PrerequisiteState" AS ENUM ('ACQUIRED', 'IN_PROGRESS', 'RECOMMENDED');

-- CreateTable
CREATE TABLE "DFFPrerequisite" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" TEXT NOT NULL,
    "state" "PrerequisiteState" NOT NULL,
    "dematerializedFeasibilityFileId" UUID,

    CONSTRAINT "DFFPrerequisite_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DFFPrerequisite" ADD CONSTRAINT "DFFPrerequisite_dematerializedFeasibilityFileId_fkey" FOREIGN KEY ("dematerializedFeasibilityFileId") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
