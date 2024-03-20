-- CreateTable
CREATE TABLE "certification_competence_bloc" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" VARCHAR(255) NOT NULL,
    "label" VARCHAR NOT NULL,
    "is_optional" BOOLEAN,
    "certification_id" UUID NOT NULL,
    "fc_competences" VARCHAR NOT NULL,

    CONSTRAINT "certification_competence_bloc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certification_competence" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" VARCHAR NOT NULL,
    "bloc_id" UUID NOT NULL,

    CONSTRAINT "certification_competence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_competence_bloc_code_key" ON "certification_competence_bloc"("code");

-- AddForeignKey
ALTER TABLE "certification_competence_bloc" ADD CONSTRAINT "certification_competence_bloc_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "certification_competence" ADD CONSTRAINT "certification_competence_bloc_id_fkey" FOREIGN KEY ("bloc_id") REFERENCES "certification_competence_bloc"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
