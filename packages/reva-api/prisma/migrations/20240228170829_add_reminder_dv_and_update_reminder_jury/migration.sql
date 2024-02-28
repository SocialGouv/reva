-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "reminder_to_organism_dv_deadline_exceeded_sent_at" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "jury" DROP COLUMN "reminder_send_at",
ADD COLUMN     "reminder_to_candidate_with_scheduled_jury_send_at" TIMESTAMPTZ(6);