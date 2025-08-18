-- DropForeignKey
ALTER TABLE "admissibility" DROP CONSTRAINT "admissibility_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "basic_skill_candidacy" DROP CONSTRAINT "basic_skill_candidacy_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_drop_out" DROP CONSTRAINT "candidacy_drop_out_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "candidacy_log" DROP CONSTRAINT "candidacy_log_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "certification_authority_local_account_on_candidacy" DROP CONSTRAINT "calaoc_candidacy";

-- DropForeignKey
ALTER TABLE "dff_attachment" DROP CONSTRAINT "dff_attachment_dematerialized_feasibility_file_id_fkey";

-- DropForeignKey
ALTER TABLE "dff_certification_competence_bloc" DROP CONSTRAINT "dff_certification_competence_bloc_dematerialized_feasibili_fkey";

-- DropForeignKey
ALTER TABLE "dff_certification_competence_details" DROP CONSTRAINT "dff_certification_competence_details_dematerialized_feasib_fkey";

-- DropForeignKey
ALTER TABLE "dff_prerequisite" DROP CONSTRAINT "dff_prerequisite_dematerializedFeasibilityFileId_fkey";

-- DropForeignKey
ALTER TABLE "dossier_de_validation" DROP CONSTRAINT "dossier_de_validation_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "exam_info" DROP CONSTRAINT "exam_info_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "feasibility_decision" DROP CONSTRAINT "feasibility_decision_feasibility_id_fkey";

-- DropForeignKey
ALTER TABLE "jury" DROP CONSTRAINT "jury_candidacy_id_fkey";

-- DropForeignKey
ALTER TABLE "training_candidacy" DROP CONSTRAINT "training_candidacy_candidacy_id_fkey";

-- AddForeignKey
ALTER TABLE "training_candidacy" ADD CONSTRAINT "training_candidacy_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_skill_candidacy" ADD CONSTRAINT "basic_skill_candidacy_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_drop_out" ADD CONSTRAINT "candidacy_drop_out_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admissibility" ADD CONSTRAINT "admissibility_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_info" ADD CONSTRAINT "exam_info_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_candidacy" ADD CONSTRAINT "calaoc_candidacy" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feasibility" ADD CONSTRAINT "feasibility_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feasibility_decision" ADD CONSTRAINT "feasibility_decision_feasibility_id_fkey" FOREIGN KEY ("feasibility_id") REFERENCES "feasibility"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_de_validation" ADD CONSTRAINT "dossier_de_validation_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury" ADD CONSTRAINT "jury_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidacy_log" ADD CONSTRAINT "candidacy_log_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_attachment" ADD CONSTRAINT "dff_attachment_dematerialized_feasibility_file_id_fkey" FOREIGN KEY ("dematerialized_feasibility_file_id") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_certification_competence_bloc" ADD CONSTRAINT "dff_certification_competence_bloc_dematerialized_feasibili_fkey" FOREIGN KEY ("dematerialized_feasibility_file_id") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_certification_competence_details" ADD CONSTRAINT "dff_certification_competence_details_dematerialized_feasib_fkey" FOREIGN KEY ("dematerialized_feasibility_file_id") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_prerequisite" ADD CONSTRAINT "dff_prerequisite_dematerializedFeasibilityFileId_fkey" FOREIGN KEY ("dematerializedFeasibilityFileId") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
