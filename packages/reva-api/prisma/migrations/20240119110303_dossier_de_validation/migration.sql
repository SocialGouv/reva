-- CreateEnum
CREATE TYPE "DossierDeValidationStatus" AS ENUM ('PENDING', 'INCOMPLETE');

-- CreateTable
CREATE TABLE "dossier_de_validation" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "dossier_de_validation_file_id" UUID NOT NULL,
    "dossier_de_validation_file_sent_at" TIMESTAMPTZ(6),
    "decision" "DossierDeValidationStatus" NOT NULL DEFAULT 'PENDING',
    "decision_comment" TEXT,
    "decision_sent_at" TIMESTAMPTZ(6),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "dossier_de_validation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dossier_de_validation_other_files_on_file" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "dossier_de_validation_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,

    CONSTRAINT "dossier_de_validation_other_files_on_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dossier_de_validation_dossier_de_validation_file_id_key" ON "dossier_de_validation"("dossier_de_validation_file_id");

-- AddForeignKey
ALTER TABLE "dossier_de_validation" ADD CONSTRAINT "dossier_de_validation_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_de_validation" ADD CONSTRAINT "dossier_de_validation_dossier_de_validation_file_id_fkey" FOREIGN KEY ("dossier_de_validation_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_de_validation_other_files_on_file" ADD CONSTRAINT "dossier_de_validation_other_files_on_file_dossier_de_valid_fkey" FOREIGN KEY ("dossier_de_validation_id") REFERENCES "dossier_de_validation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dossier_de_validation_other_files_on_file" ADD CONSTRAINT "dossier_de_validation_other_files_on_file_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
