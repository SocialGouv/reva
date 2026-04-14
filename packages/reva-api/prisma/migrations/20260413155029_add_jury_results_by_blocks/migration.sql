-- CreateTable
CREATE TABLE "jury_result_by_competence_bloc" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "jury_id" UUID NOT NULL,
    "competence_bloc_id" UUID NOT NULL,
    "is_competence_bloc_validated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "jury_result_by_competence_bloc_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "jury_result_by_competence_bloc" ADD CONSTRAINT "jury_result_by_competence_bloc_jury_id_fkey" FOREIGN KEY ("jury_id") REFERENCES "jury"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury_result_by_competence_bloc" ADD CONSTRAINT "jury_result_by_competence_bloc_competence_bloc_id_fkey" FOREIGN KEY ("competence_bloc_id") REFERENCES "certification_competence_bloc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
