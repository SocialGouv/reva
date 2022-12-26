-- CreateEnum
CREATE TYPE "AdmissibilityStatus" AS ENUM ('ADMISSIBLE', 'NOT_ADMISSIBLE');
-- CreateTable
CREATE TABLE "admissibility" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "is_candidate_already_admissible" BOOLEAN NOT NULL DEFAULT false,
    "report_sent_at" TIMESTAMP(3),
    "certifier_responded_at" TIMESTAMP(3),
    "response_available_to_candidate_at" TIMESTAMP(3),
    "status" "AdmissibilityStatus",
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "admissibility_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "admissibility_candidacy_id_key" ON "admissibility"("candidacy_id");
-- AddForeignKey
ALTER TABLE "admissibility"
ADD CONSTRAINT "admissibility_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Create Admissibility entries for existing candidacies
DO $$
DECLARE cid uuid;
BEGIN FOR cid IN
SELECT id
FROM candidacy
WHERE id NOT IN (
        SELECT candidacy_id
        FROM admissibility
    ) LOOP
INSERT INTO admissibility (id, candidacy_id)
VALUES (gen_random_uuid(), cid);
END LOOP;
END $$;