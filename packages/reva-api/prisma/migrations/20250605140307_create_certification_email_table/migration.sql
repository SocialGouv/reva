-- CreateEnum
CREATE TYPE "CertificationEmailType" AS ENUM ('CERTIFICATION_WILL_EXPIRE_IN_1_MONTH', 'CERTIFICATION_WILL_EXPIRE_TODAY');

-- CreateTable
CREATE TABLE "certification_email" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_id" UUID NOT NULL,
    "email_type" "CertificationEmailType" NOT NULL,
    "sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certification_email_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certification_email" ADD CONSTRAINT "certification_email_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
