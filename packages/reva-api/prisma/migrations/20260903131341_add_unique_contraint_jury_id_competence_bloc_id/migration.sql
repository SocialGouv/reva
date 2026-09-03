/*
  Warnings:

  - A unique constraint covering the columns `[jury_id,competence_bloc_id]` on the table `jury_result_by_competence_bloc` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "jury_result_by_competence_bloc_jury_id_competence_bloc_id_key" ON "jury_result_by_competence_bloc"("jury_id", "competence_bloc_id");
