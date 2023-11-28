-- DropForeignKey
ALTER TABLE "maison_mere_aap_on_departements" DROP CONSTRAINT "maison_mere_aap_on_departements_departement_id_fkey";

-- DropForeignKey
ALTER TABLE "maison_mere_aap_on_departements" DROP CONSTRAINT "maison_mere_aap_on_departements_maison_mere_aap_id_fkey";

-- DropTable
DROP TABLE "maison_mere_aap_on_departements";

-- CreateTable
CREATE TABLE "maison_mere_aap_on_departement" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "departement_id" UUID NOT NULL,
    "est_sur_place" BOOLEAN NOT NULL DEFAULT false,
    "est_a_distance" BOOLEAN NOT NULL DEFAULT false,
    "maison_mere_aap_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "maison_mere_aap_on_departement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_departement" ADD CONSTRAINT "maison_mere_aap_on_departement_departement_id_fkey" FOREIGN KEY ("departement_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "maison_mere_aap_on_departement" ADD CONSTRAINT "maison_mere_aap_on_departement_maison_mere_aap_id_fkey" FOREIGN KEY ("maison_mere_aap_id") REFERENCES "maison_mere_aap"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
