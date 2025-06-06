-- CreateEnum
CREATE TYPE "CertificationAuthorityLogUserProfile" AS ENUM ('CERTIFICATION_AUTHORITY', 'CERTIFICATION_AUTHORITY_LOCAL_ACCOUNT');

-- CreateTable
CREATE TABLE "certification_authority_log" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_keycloak_id" UUID NOT NULL,
    "user_email" VARCHAR(255) NOT NULL,
    "user_profile" "CertificationAuthorityLogUserProfile" NOT NULL,
    "certification_authority_id" UUID NOT NULL,
    "certification_authority_local_account_id" UUID,
    "event_type" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_authority_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "certification_authority_log_certification_authority_id_idx" ON "certification_authority_log"("certification_authority_id");

-- CreateIndex
CREATE INDEX "certification_authority_log_certification_authority_local_a_idx" ON "certification_authority_log"("certification_authority_local_account_id");

-- AddForeignKey
ALTER TABLE "certification_authority_log" ADD CONSTRAINT "certification_authority_log_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_log" ADD CONSTRAINT "certification_authority_log_certification_authority_local__fkey" FOREIGN KEY ("certification_authority_local_account_id") REFERENCES "certification_authority_local_account"("id") ON DELETE SET NULL ON UPDATE CASCADE;
