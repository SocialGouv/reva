-- CreateTable
CREATE TABLE "certification_on_domaine" (
    "domaine_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_on_domaine_pkey" PRIMARY KEY ("domaine_id","certification_id")
);

-- AddForeignKey
ALTER TABLE "certification_on_domaine" ADD CONSTRAINT "certification_on_domaine_domaine_id_fkey" FOREIGN KEY ("domaine_id") REFERENCES "domaine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_on_domaine" ADD CONSTRAINT "certification_on_domaine_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
