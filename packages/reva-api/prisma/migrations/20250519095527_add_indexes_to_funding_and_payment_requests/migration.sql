-- CreateIndex
CREATE INDEX "funding_request_candidacy_id_idx" ON "funding_request"("candidacy_id");

-- CreateIndex
CREATE INDEX "funding_request_unifvae_candidacy_id_idx" ON "funding_request_unifvae"("candidacy_id");

-- CreateIndex
CREATE INDEX "payment_request_candidacy_id_idx" ON "payment_request"("candidacy_id");

-- CreateIndex
CREATE INDEX "payment_request_candidacy_id_confirmed_at_idx" ON "payment_request"("candidacy_id", "confirmed_at");

-- CreateIndex
CREATE INDEX "payment_request_unifvae_candidacy_id_idx" ON "payment_request_unifvae"("candidacy_id");

-- CreateIndex
CREATE INDEX "payment_request_unifvae_candidacy_id_confirmed_at_idx" ON "payment_request_unifvae"("candidacy_id", "confirmed_at");
