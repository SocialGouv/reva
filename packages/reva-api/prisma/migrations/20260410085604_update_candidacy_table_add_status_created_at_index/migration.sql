-- CreateIndex
CREATE INDEX "candidacy_status_created_at_idx" ON "candidacy"("status", "created_at" DESC);
