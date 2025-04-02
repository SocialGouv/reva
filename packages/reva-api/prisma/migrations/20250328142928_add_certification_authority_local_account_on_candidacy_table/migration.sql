-- CreateTable
CREATE TABLE "certification_authority_local_account_on_candidacy" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_authority_local_account_id" UUID NOT NULL,
    "candidacy_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_authority_local_account_on_candidacy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_local_account_on_candidacy_certific_key" ON "certification_authority_local_account_on_candidacy"("certification_authority_local_account_id", "candidacy_id");

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_candidacy" ADD CONSTRAINT "certification_authority_local_account_on_candidacy_certifi_fkey" FOREIGN KEY ("certification_authority_local_account_id") REFERENCES "certification_authority_local_account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_local_account_on_candidacy" ADD CONSTRAINT "calaoc_candidacy" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
