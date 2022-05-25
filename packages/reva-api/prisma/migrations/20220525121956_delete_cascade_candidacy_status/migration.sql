-- DropForeignKey
ALTER TABLE "candidacy_candidacy_status" DROP CONSTRAINT "candidacy_candidacy_status_candidacy_id_fkey";

-- AddForeignKey
ALTER TABLE "candidacy_candidacy_status" ADD CONSTRAINT "candidacy_candidacy_status_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
