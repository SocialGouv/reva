UPDATE "candidacy_candidacy_status"
set status = 'DEMANDE_FINANCEMENT_ENVOYE'
where status = 'DEMANDE_PAIEMENT_ENVOYEE';
TRUNCATE TABLE "payment_request_batch" CASCADE;
TRUNCATE TABLE "payment_request" CASCADE;
ALTER TABLE "payment_request"
ADD COLUMN "basic_skills_effective_cost" DECIMAL(10, 2) NOT NULL,
  ADD COLUMN "certificate_skills_effective_cost" DECIMAL(10, 2) NOT NULL,
  ADD COLUMN "collective_effective_cost" DECIMAL(10, 2) NOT NULL,
  ADD COLUMN "diagnosis_effective_cost" DECIMAL(10, 2) NOT NULL,
  ADD COLUMN "exam_effective_cost" DECIMAL(10, 2) NOT NULL,
  ADD COLUMN "individual_effective_cost" DECIMAL(10, 2) NOT NULL,
  ADD COLUMN "mandatory_training_effective_cost" DECIMAL(10, 2) NOT NULL,
  ADD COLUMN "post_exam_effective_cost" DECIMAL(10, 2) NOT NULL;