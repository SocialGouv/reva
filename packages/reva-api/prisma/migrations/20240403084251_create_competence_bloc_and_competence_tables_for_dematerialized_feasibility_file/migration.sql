-- CreateTable
CREATE TABLE "dff_certification_competence_bloc" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dematerialized_feasibility_file_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "code" VARCHAR(255),
    "label" VARCHAR NOT NULL,
    "is_optional" BOOLEAN,

    CONSTRAINT "dff_certification_competence_bloc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dff_certification_competence" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "label" VARCHAR NOT NULL,
    "bloc_id" UUID NOT NULL,

    CONSTRAINT "dff_certification_competence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dff_certification_competence_bloc_code_key" ON "dff_certification_competence_bloc"("code");

-- AddForeignKey
ALTER TABLE "dff_certification_competence_bloc" ADD CONSTRAINT "dff_certification_competence_bloc_dematerialized_feasibili_fkey" FOREIGN KEY ("dematerialized_feasibility_file_id") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_certification_competence" ADD CONSTRAINT "dff_certification_competence_bloc_id_fkey" FOREIGN KEY ("bloc_id") REFERENCES "dff_certification_competence_bloc"("id") ON DELETE CASCADE ON UPDATE NO ACTION;