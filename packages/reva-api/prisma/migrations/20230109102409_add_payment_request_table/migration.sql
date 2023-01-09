-- CreateTable
CREATE TABLE "payment_request" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "diagnosis_effective_hour_count" INTEGER NOT NULL,
    "post_exam_effective_hour_count" INTEGER NOT NULL,
    "individual_effective_hour_count" INTEGER NOT NULL,
    "collective_effective_hour_count" INTEGER NOT NULL,
    "mandatory_training_effective_hour_count" INTEGER NOT NULL,
    "basic_skills_effective_hour_count" INTEGER NOT NULL,
    "certificate_skills_effective_hour_count" INTEGER NOT NULL,
    "exam_effective_hour_count" INTEGER NOT NULL,

    CONSTRAINT "payment_request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_request_candidacy_id_key" ON "payment_request"("candidacy_id");

-- AddForeignKey
ALTER TABLE "payment_request" ADD CONSTRAINT "payment_request_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
