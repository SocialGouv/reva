-- CreateTable
CREATE TABLE "jury" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "certification_authority_id" UUID NOT NULL,
    "convocation_file_id" UUID,
    "date_of_session" TIMESTAMPTZ(6) NOT NULL,
    "time_of_session" TEXT,
    "address_of_session" TEXT,
    "information_of_session" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "jury_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jury_convocation_file_id_key" ON "jury"("convocation_file_id");

-- AddForeignKey
ALTER TABLE "jury" ADD CONSTRAINT "jury_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury" ADD CONSTRAINT "jury_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jury" ADD CONSTRAINT "jury_convocation_file_id_fkey" FOREIGN KEY ("convocation_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;
