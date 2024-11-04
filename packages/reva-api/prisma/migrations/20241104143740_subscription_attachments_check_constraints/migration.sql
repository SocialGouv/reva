-- DropForeignKey
ALTER TABLE "subscription_request" DROP CONSTRAINT "sr_attestation_urssaf_file";

-- DropForeignKey
ALTER TABLE "subscription_request" DROP CONSTRAINT "sr_justificatif_identite_dirigeant_file";

-- AlterTable
ALTER TABLE "subscription_request" ALTER COLUMN "attestation_urssaf_file_id" DROP NOT NULL,
ALTER COLUMN "justificatif_identite_dirigeant_file_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "subscription_request" ADD CONSTRAINT "sr_attestation_urssaf_file" FOREIGN KEY ("attestation_urssaf_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_request" ADD CONSTRAINT "sr_justificatif_identite_dirigeant_file" FOREIGN KEY ("justificatif_identite_dirigeant_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;


ALTER TABLE "subscription_request"
  ADD CONSTRAINT "attestation_urssaf_file_check" CHECK (status = 'REJECTED' OR attestation_urssaf_file_id IS NOT NULL),
  ADD CONSTRAINT "justificatif_identite_dirigeant_file_check" CHECK (status = 'REJECTED' OR justificatif_identite_dirigeant_file_id IS NOT NULL);