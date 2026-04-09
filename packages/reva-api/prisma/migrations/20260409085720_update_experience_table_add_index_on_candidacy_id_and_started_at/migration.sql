-- DropIndex
DROP INDEX "experience_candidacy_id_idx";

-- CreateIndex
CREATE INDEX "experience_candidacy_id_startedAt_idx" ON "experience"("candidacy_id", "startedAt" DESC);
