/*
  Warnings:

  - A unique constraint covering the columns `[dematerialized_feasibility_file_id,certification_competence_bloc_id]` on the table `dff_certification_competence_bloc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "dff_certification_competence_bloc_dematerialized_feasibilit_key" ON "dff_certification_competence_bloc"("dematerialized_feasibility_file_id", "certification_competence_bloc_id");
