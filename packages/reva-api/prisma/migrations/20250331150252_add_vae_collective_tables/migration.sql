-- CreateTable
CREATE TABLE "commanditaire_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "raison_sociale" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "commanditaire_vae_collective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projet_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nom" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "projet_vae_collective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorte_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "code_inscription" VARCHAR(15) NOT NULL,

    CONSTRAINT "cohorte_vae_collective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_vae_collective" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "cohorte_vae_collective_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,

    CONSTRAINT "certification_vae_collective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_vae_collective_on_organism" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_cohorte_vae_collective_id" UUID NOT NULL,
    "organism_id" UUID NOT NULL,

    CONSTRAINT "certification_vae_collective_on_organism_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_vae_collective_on_certification_authority" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_cohorte_vae_collective_id" UUID NOT NULL,
    "certification_authority_id" UUID NOT NULL,

    CONSTRAINT "certification_vae_collective_on_certification_authority_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cohorte_vae_collective_code_inscription_key" ON "cohorte_vae_collective"("code_inscription");

-- AddForeignKey
ALTER TABLE "certification_vae_collective" ADD CONSTRAINT "certification_vae_collective_cohorte_vae_collective_id_fkey" FOREIGN KEY ("cohorte_vae_collective_id") REFERENCES "cohorte_vae_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective" ADD CONSTRAINT "certification_vae_collective_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_organism" ADD CONSTRAINT "ccvco_certification_cohorte" FOREIGN KEY ("certification_cohorte_vae_collective_id") REFERENCES "certification_vae_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_organism" ADD CONSTRAINT "ccvco_organism" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority" ADD CONSTRAINT "ccvco_certification_cohorte" FOREIGN KEY ("certification_cohorte_vae_collective_id") REFERENCES "certification_vae_collective"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority" ADD CONSTRAINT "ccvco_certification_authority" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
