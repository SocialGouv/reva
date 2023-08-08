-- CreateEnum
CREATE TYPE "FinanceModule" AS ENUM ('unireva', 'unifvae');
-- AlterTable
ALTER TABLE "candidacy"
ADD COLUMN "finance_module" "FinanceModule" NOT NULL DEFAULT 'unifvae';
-- CreateTable
CREATE TABLE "funding_request_unifvae" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "candidacy_id" UUID NOT NULL,
  "companion_id" UUID,
  "post_exam_hour_count" INTEGER NOT NULL,
  "post_exam_cost" DECIMAL(10, 2) NOT NULL,
  "individual_hour_count" INTEGER NOT NULL,
  "individual_cost" DECIMAL(10, 2) NOT NULL,
  "collective_hour_count" INTEGER NOT NULL,
  "collective_cost" DECIMAL(10, 2) NOT NULL,
  "basic_skills_hour_count" INTEGER NOT NULL,
  "basic_skills_cost" DECIMAL(10, 2) NOT NULL,
  "mandatory_training_hour_count" INTEGER NOT NULL,
  "mandatory_training_cost" DECIMAL(10, 2) NOT NULL,
  "certificate_skills" TEXT NOT NULL,
  "certificate_skills_hour_count" INTEGER NOT NULL,
  "certificate_skills_cost" DECIMAL(10, 2) NOT NULL,
  "other_training" TEXT NOT NULL,
  "other_training_hour_count" INTEGER NOT NULL DEFAULT 0,
  "other_training_cost" DECIMAL(10, 2) NOT NULL DEFAULT 0,
  CONSTRAINT "funding_request_unifvae_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "basic_skill_funding_request_unifvae" (
  "basic_skill_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6),
  "funding_request_unifvae_id" UUID NOT NULL,
  CONSTRAINT "basic_skill_funding_request_unifvae_pkey" PRIMARY KEY ("basic_skill_id", "funding_request_unifvae_id")
);
-- CreateTable
CREATE TABLE "training_funding_request_unifvae" (
  "training_id" UUID NOT NULL,
  "funding_request_unifvae_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6),
  CONSTRAINT "training_funding_request_unifvae_pkey" PRIMARY KEY ("training_id", "funding_request_unifvae_id")
);
-- CreateIndex
CREATE UNIQUE INDEX "funding_request_unifvae_candidacy_id_key" ON "funding_request_unifvae"("candidacy_id");
-- AddForeignKey
ALTER TABLE "funding_request_unifvae"
ADD CONSTRAINT "funding_request_unifvae_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "funding_request_unifvae"
ADD CONSTRAINT "funding_request_unifvae_companion_id_fkey" FOREIGN KEY ("companion_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "basic_skill_funding_request_unifvae"
ADD CONSTRAINT "basic_skill_funding_request_unifvae_basic_skill_id_fkey" FOREIGN KEY ("basic_skill_id") REFERENCES "basic_skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "basic_skill_funding_request_unifvae"
ADD CONSTRAINT "basic_skill_funding_request_unifvae_funding_request_unifva_fkey" FOREIGN KEY ("funding_request_unifvae_id") REFERENCES "funding_request_unifvae"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "training_funding_request_unifvae"
ADD CONSTRAINT "training_funding_request_unifvae_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "training_funding_request_unifvae"
ADD CONSTRAINT "training_funding_request_unifvae_funding_request_unifvae_i_fkey" FOREIGN KEY ("funding_request_unifvae_id") REFERENCES "funding_request_unifvae"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Migrate finance_module for Reva XP candidacies
update candidacy
set finance_module = 'unireva'
where id in (
    select c.id
    from candidacy c
      inner join organism o on o.id = c.organism_id
    where o.typology = 'experimentation'
  )