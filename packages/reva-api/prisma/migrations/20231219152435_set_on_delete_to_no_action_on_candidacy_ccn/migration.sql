-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_ccn_id_fkey";

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_ccn_id_fkey" FOREIGN KEY ("ccn_id") REFERENCES "candidacy_convention_collective"("id") ON DELETE NO ACTION ON UPDATE CASCADE DEFERRABLE;
