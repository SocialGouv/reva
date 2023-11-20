-- CreateEnum
CREATE TYPE "ConformiteNormeAccessibilite" AS ENUM (
    'CONFORME',
    'NON_CONFORME',
    'ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC'
);
-- AlterTable
ALTER TABLE "organism"
ADD COLUMN "organism_informations_commerciales_id" UUID;
-- CreateTable
CREATE TABLE "organism_informations_commerciales" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "organism_id" UUID NOT NULL,
    "nom" TEXT,
    "telephone" TEXT,
    "site_internet" VARCHAR(255),
    "email_contact" VARCHAR(255),
    "adresse_numero_et_nom_de_rue" VARCHAR(255),
    "adresse_informations_complementaires" VARCHAR(255),
    "adresse_code_postal" VARCHAR(255),
    "adresse_ville" VARCHAR(255),
    "conformeNormesAccessbilite" "ConformiteNormeAccessibilite",
    CONSTRAINT "organism_informations_commerciales_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "organism_informations_commerciales_organism_id_key" ON "organism_informations_commerciales"("organism_id");
-- AddForeignKey
ALTER TABLE "organism_informations_commerciales"
ADD CONSTRAINT "organism_informations_commerciales_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;