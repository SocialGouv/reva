-- AlterTable
ALTER TABLE "certification_on_ccn" DROP CONSTRAINT "certification_on_ccn_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ADD CONSTRAINT "certification_on_ccn_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "certification_on_domaine" DROP CONSTRAINT "certification_on_domaine_pkey",
ADD COLUMN     "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
ADD CONSTRAINT "certification_on_domaine_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_on_ccn_ccn_id_certification_id_key" ON "certification_on_ccn"("ccn_id", "certification_id");

-- CreateIndex
CREATE UNIQUE INDEX "certification_on_domaine_domaine_id_certification_id_key" ON "certification_on_domaine"("domaine_id", "certification_id");
