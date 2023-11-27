-- CreateTable
CREATE TABLE "maison_mere_aap" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "raison_sociale" VARCHAR(255) NOT NULL,
    "statut_juridique" "LegalStatus" NOT NULL,
    "siret" VARCHAR(255) NOT NULL,
    "adresse" VARCHAR(255) NOT NULL DEFAULT '',
    "code_postal" VARCHAR(5) NOT NULL DEFAULT '',
    "ville" VARCHAR(100) NOT NULL DEFAULT '',
    "typologie" "OrganismTypology" NOT NULL,
    "site_web" VARCHAR(255),
    "date_expiration_certification_qualiopi" TIMESTAMP(3) NOT NULL,
    "gestionnaire_account_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "maison_mere_aap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maison_mere_aap_on_ccn" (
    "ccn_id" UUID NOT NULL,
    "maison_mere_aap_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "maison_mere_aap_on_ccn_pkey" PRIMARY KEY ("ccn_id","maison_mere_aap_id")
);

-- CreateTable
CREATE TABLE "maison_mere_aap_on_departements" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "departement_id" UUID NOT NULL,
    "est_sur_place" BOOLEAN NOT NULL DEFAULT false,
    "est_a_distance" BOOLEAN NOT NULL DEFAULT false,
    "maison_mere_aap_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "maison_mere_aap_on_departements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "maison_mere_aap_on_domaine" (
    "domaine_id" UUID NOT NULL,
    "maison_mere_aap_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "maison_mere_aap_on_domaine_pkey" PRIMARY KEY ("domaine_id","maison_mere_aap_id")
);

-- AddForeignKey
ALTER TABLE "maison_mere_aap" ADD CONSTRAINT "maison_mere_aap_gestionnaire_account_id_fkey" FOREIGN KEY ("gestionnaire_account_id") REFERENCES "account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_ccn" ADD CONSTRAINT "maison_mere_aap_on_ccn_ccn_id_fkey" FOREIGN KEY ("ccn_id") REFERENCES "convention_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_ccn" ADD CONSTRAINT "maison_mere_aap_on_ccn_maison_mere_aap_id_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_departements" ADD CONSTRAINT "maison_mere_aap_on_departements_departement_id_fkey" FOREIGN KEY ("departement_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_departements" ADD CONSTRAINT "maison_mere_aap_on_departements_maison_mere_aap_id_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_domaine" ADD CONSTRAINT "maison_mere_aap_on_domaine_domaine_id_fkey" FOREIGN KEY ("domaine_id") REFERENCES "domaine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_domaine" ADD CONSTRAINT "maison_mere_aap_on_domaine_maison_mere_aap_id_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "organism" ADD COLUMN     "maison_mere_aap_id" UUID;

-- AddForeignKey
ALTER TABLE "organism" ADD CONSTRAINT "organism_maison_mere_aap_id_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE NO ACTION ON UPDATE CASCADE;