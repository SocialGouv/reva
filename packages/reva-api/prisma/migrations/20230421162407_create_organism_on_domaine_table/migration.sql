-- CreateTable
CREATE TABLE "organism_on_domaine" (
    "domaine_id" UUID NOT NULL,
    "organism_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "organism_on_domaine_pkey" PRIMARY KEY ("domaine_id","organism_id")
);

-- AddForeignKey
ALTER TABLE "organism_on_domaine" ADD CONSTRAINT "organism_on_domaine_domaine_id_fkey" FOREIGN KEY ("domaine_id") REFERENCES "domaine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_domaine" ADD CONSTRAINT "organism_on_domaine_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
