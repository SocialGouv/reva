-- CreateEnum
CREATE TYPE "LegalStatus" AS ENUM ('EI', 'EURL', 'SARL', 'SAS', 'SASU', 'SA');

-- CreateTable
CREATE TABLE "SubscriptionRequest" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "company_name" VARCHAR(255) NOT NULL,
    "company_legal_status" "LegalStatus" NOT NULL,
    "company_siret" VARCHAR(255) NOT NULL,
    "company_address" VARCHAR(255) NOT NULL,
    "company_billing_address" VARCHAR(255) NOT NULL,
    "company_billing_email" VARCHAR(255) NOT NULL,
    "company_bic" VARCHAR(50) NOT NULL,
    "company_iban" VARCHAR(50) NOT NULL,
    "account_firstname" VARCHAR(100) NOT NULL,
    "account_lastname" VARCHAR(100) NOT NULL,
    "account_email" VARCHAR(255) NOT NULL,
    "account_phone_number" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubscriptionRequest_pkey" PRIMARY KEY ("id")
);
