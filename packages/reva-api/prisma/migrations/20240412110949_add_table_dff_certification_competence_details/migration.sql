-- CreateTable
CREATE TABLE "dff_certification_competence_details" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dematerialized_feasibility_file_id" UUID NOT NULL,
    "certification_competence_bloc_id" UUID NOT NULL,
    "text"  TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "dff_certification_competence_details_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dff_certification_competence_details" ADD CONSTRAINT "dff_certification_competence_details_dematerialized_feasib_fkey" FOREIGN KEY ("dematerialized_feasibility_file_id") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_certification_competence_details" ADD CONSTRAINT "dff_certification_competence_details_certification_compete_fkey" FOREIGN KEY ("certification_competence_bloc_id") REFERENCES "certification_competence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
