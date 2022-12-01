-- CreateTable
CREATE TABLE "funding_request" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "companion_id" UUID NOT NULL,
    "diagnosis_hour_count" INTEGER NOT NULL,
    "diagnosis_cost" INTEGER NOT NULL,
    "post_exam_hour_count" INTEGER NOT NULL,
    "post_exam_cost" INTEGER NOT NULL,
    "individual_hour_count" INTEGER NOT NULL,
    "individual_cost" INTEGER NOT NULL,
    "collective_hour_count" INTEGER NOT NULL,
    "collective_cost" INTEGER NOT NULL,
    "additional_hour_count" INTEGER NOT NULL,
    "additional_cost" INTEGER NOT NULL,
    "basic_skills_hour_count" INTEGER NOT NULL,
    "basic_skills_cost" INTEGER NOT NULL,
    "certificate_skills" TEXT NOT NULL,
    "certificate_skills_hour_count" INTEGER NOT NULL,
    "certificate_skills_cost" INTEGER NOT NULL,
    "other_training" TEXT NOT NULL,
    "other_training_hour_count" INTEGER NOT NULL,
    "other_training_cost" INTEGER NOT NULL,
    "exam_hour_count" INTEGER NOT NULL,
    "exam_cost" INTEGER NOT NULL,

    CONSTRAINT "funding_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basic_skill_funding_request" (
    "basic_skill_id" UUID NOT NULL,
    "funding_request_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "basic_skill_funding_request_pkey" PRIMARY KEY ("basic_skill_id","funding_request_id")
);

-- CreateTable
CREATE TABLE "training_funding_request" (
    "training_id" UUID NOT NULL,
    "funding_request_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "training_funding_request_pkey" PRIMARY KEY ("training_id","funding_request_id")
);

-- AddForeignKey
ALTER TABLE "funding_request" ADD CONSTRAINT "funding_request_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "funding_request" ADD CONSTRAINT "funding_request_companion_id_fkey" FOREIGN KEY ("companion_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_skill_funding_request" ADD CONSTRAINT "basic_skill_funding_request_basic_skill_id_fkey" FOREIGN KEY ("basic_skill_id") REFERENCES "basic_skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "basic_skill_funding_request" ADD CONSTRAINT "basic_skill_funding_request_funding_request_id_fkey" FOREIGN KEY ("funding_request_id") REFERENCES "funding_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_funding_request" ADD CONSTRAINT "training_funding_request_training_id_fkey" FOREIGN KEY ("training_id") REFERENCES "training"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_funding_request" ADD CONSTRAINT "training_funding_request_funding_request_id_fkey" FOREIGN KEY ("funding_request_id") REFERENCES "funding_request"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
