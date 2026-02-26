-- CreateTable
CREATE TABLE "parcours_certification" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "uai" VARCHAR(255) NOT NULL,
    "nom_etablissement" VARCHAR(255),
    "certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "parcours_certification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parcours_certification_code_key" ON "parcours_certification"("code");

-- CreateIndex
CREATE UNIQUE INDEX "parcours_certification_uai_key" ON "parcours_certification"("uai");

-- AddForeignKey
ALTER TABLE "parcours_certification" ADD CONSTRAINT "parcours_certification_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
