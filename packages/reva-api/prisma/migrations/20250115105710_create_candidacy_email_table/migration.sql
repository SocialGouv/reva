-- CreateEnum
CREATE TYPE "CandidacyEmailType" AS ENUM ('CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_AAP', 'CANDIDACY_IS_CADUQUE_SOON_WARNING_TO_CANDIDATE', 'CANDIDACY_IS_CADUQUE_NOTICE_TO_AAP');

-- CreateTable
CREATE TABLE "candidacy_email" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "email_type" "CandidacyEmailType" NOT NULL,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidacy_email_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "candidacy_email" ADD CONSTRAINT "candidacy_email_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
