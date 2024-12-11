-- CreateEnum
CREATE TYPE "CertificationAuthorityContestationDecision" AS ENUM ('CADUCITE_INVALIDATED', 'CADUCITE_CONFIRMED');

-- CreateTable
CREATE TABLE "candidacy_contestation_caducite" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "contestation_reason" TEXT NOT NULL,
    "certification_authority_contestation_decision" "CertificationAuthorityContestationDecision",
    "contestation_sent_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "candidacy_contestation_caducite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "candidacy_contestation_caducite_candidacy_id_idx" ON "candidacy_contestation_caducite"("candidacy_id");

-- AddForeignKey
ALTER TABLE "candidacy_contestation_caducite" ADD CONSTRAINT "candidacy_contestation_caducite_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE CASCADE ON UPDATE CASCADE;
