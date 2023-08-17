-- AlterTable
ALTER TABLE "funding_request_unifvae"
ADD COLUMN "num_action" TEXT NOT NULL DEFAULT 'TO_MIGRATE';
CREATE SEQUENCE funding_request_unifvae_num_action_sequence MINVALUE 100000 MAXVALUE 199999 CYCLE;