-- CreateEnum
CREATE TYPE "EndAccompagnementReason" AS ENUM ('CONTRAT_ACCOMPAGNEMENT_TERMINE', 'CHOIX_CANDIDAT', 'CHOIX_AAP', 'ABANDON_OU_NON_REPONSE_CANDIDAT', 'FERMETURE_STRUCTURE');

-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "end_accompagnement_candidate_drop_out_reason_id" UUID,
ADD COLUMN     "end_accompagnement_reason" "EndAccompagnementReason";

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_end_accompagnement_candidate_drop_out_reason_id_fkey" FOREIGN KEY ("end_accompagnement_candidate_drop_out_reason_id") REFERENCES "drop_out_reason"("id") ON DELETE SET NULL ON UPDATE CASCADE;
