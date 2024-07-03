ALTER TABLE "subscription_request_v2"
RENAME TO "subscription_request";

ALTER TABLE "subscription_request" RENAME CONSTRAINT "subscription_request_v2_pkey" TO "subscription_request_pkey";

ALTER TABLE "subscription_request" RENAME CONSTRAINT "srv2_attestation_urssaf_file" TO "sr_attestation_urssaf_file";

ALTER TABLE "subscription_request" RENAME CONSTRAINT "srv2_justificatif_identite_dirigeant_file" TO "sr_justificatif_identite_dirigeant_file";

ALTER TABLE "subscription_request" RENAME CONSTRAINT "subscription_request_v2_lettre_de_delegation_file_id_fkey" TO "sr_lettre_de_delegation_file";

ALTER TABLE "subscription_request" RENAME CONSTRAINT "srv2_justificatif_identite_delegataire_file" TO "sr_justificatif_identite_delegataire_file";