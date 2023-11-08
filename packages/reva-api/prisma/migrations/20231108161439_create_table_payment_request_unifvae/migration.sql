-- CreateTable
CREATE TABLE "payment_request_unifvae" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "individual_effective_hour_count" DECIMAL NOT NULL,
    "individual_effective_cost" DECIMAL(10, 2) NOT NULL,
    "collective_effective_hour_count" DECIMAL NOT NULL,
    "collective_effective_cost" DECIMAL(10, 2) NOT NULL,
    "mandatory_training_effective_hour_count" DECIMAL NOT NULL,
    "mandatory_training_effective_cost" DECIMAL(10, 2) NOT NULL,
    "basic_skills_effective_hour_count" DECIMAL NOT NULL,
    "basic_skills_effective_cost" DECIMAL(10, 2) NOT NULL,
    "certificate_skills_effective_hour_count" DECIMAL NOT NULL,
    "certificate_skills_effective_cost" DECIMAL(10, 2) NOT NULL,
    "other_training_effective_hour_count" DECIMAL NOT NULL DEFAULT 0,
    "other_training_effective_cost" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "invoice_number" TEXT NOT NULL,
    CONSTRAINT "payment_request_unifvae_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "payment_request_unifvae_candidacy_id_key" ON "payment_request_unifvae"("candidacy_id");
-- AddForeignKey
ALTER TABLE "payment_request_unifvae"
ADD CONSTRAINT "payment_request_unifvae_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;