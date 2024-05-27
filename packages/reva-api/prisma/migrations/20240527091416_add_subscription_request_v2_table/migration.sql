-- CreateTable
CREATE TABLE "subscription_request_v2" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "companySiret" TEXT NOT NULL,
    "companyLegalStatus" "LegalStatus" NOT NULL,
    "companyName" TEXT NOT NULL,
    "managerFirstname" TEXT NOT NULL,
    "managerLastname" TEXT NOT NULL,
    "accountFirstname" TEXT NOT NULL,
    "accountLastname" TEXT NOT NULL,
    "accountEmail" TEXT NOT NULL,
    "accountPhoneNumber" TEXT NOT NULL,
    "companyWebsite" TEXT NOT NULL,
    "delegataire" BOOLEAN NOT NULL,
    "attestation_urssaf_file_id" UUID NOT NULL,
    "justificatif_identite_dirigeant_file_id" UUID NOT NULL,
    "lettre_de_delegation_file_id" UUID,
    "justificatif_identite_delegataire_file_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_request_v2_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "subscription_request_v2" ADD CONSTRAINT "srv2_attestation_urssaf_file" FOREIGN KEY ("attestation_urssaf_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_v2" ADD CONSTRAINT "srv2_justificatif_identite_dirigeant_file" FOREIGN KEY ("justificatif_identite_dirigeant_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_v2" ADD CONSTRAINT "subscription_request_v2_lettre_de_delegation_file_id_fkey" FOREIGN KEY ("lettre_de_delegation_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request_v2" ADD CONSTRAINT "srv2_justificatif_identite_delegataire_file" FOREIGN KEY ("justificatif_identite_delegataire_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
