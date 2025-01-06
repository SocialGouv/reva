-- AlterTable
ALTER TABLE "candidacy_drop_out"
ADD COLUMN "auto_drop_out_confirmation_emails_sent" BOOLEAN NOT NULL DEFAULT false;

-- We don't want to send the auto dropout confirmation emails to old candidacies
UPDATE candidacy_drop_out
SET
    auto_drop_out_confirmation_emails_sent = true
where
    proof_received_by_admin = false
    and drop_out_confirmed_by_candidate = false
    and created_at < (NOW () - interval ' 6 months');