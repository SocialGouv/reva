-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "ccn_id" UUID,
ADD COLUMN     "typology" "CandidateTypology" NOT NULL DEFAULT 'NON_SPECIFIE',
ADD COLUMN     "typology_additional" TEXT;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_ccn_id_fkey" FOREIGN KEY ("ccn_id") REFERENCES "candidacy_convention_collective"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- Update candidate table with ccn and typology from the most recent candidacy
UPDATE "candidate" c
SET 
  "ccn_id" = latest_candidacy."ccn_id",
  "typology" = latest_candidacy."typology",
  "typology_additional" = latest_candidacy."typology_additional"
FROM (
  SELECT DISTINCT ON ("candidate_id")
    "candidate_id",
    "ccn_id",
    "typology",
    "typology_additional"
  FROM "candidacy"
  WHERE "candidate_id" IS NOT NULL
  ORDER BY "candidate_id", "created_at" DESC
) latest_candidacy
WHERE c."id" = latest_candidacy."candidate_id";
