-- CreateTable
CREATE TABLE "certification_additional_info" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link_to_referential" TEXT NOT NULL,
    "link_to_corresponence_table" TEXT,
    "dossier_de_validation_file_id" UUID NOT NULL,
    "link_to_jury_guide" TEXT,
    "certification_expert_contact_details" TEXT,
    "useful_resources" TEXT,
    "comments_for_aap" TEXT,
    "certification_id" UUID NOT NULL,

    CONSTRAINT "certification_additional_info_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_additional_info_certification_id_key" ON "certification_additional_info"("certification_id");

-- AddForeignKey
ALTER TABLE "certification_additional_info" ADD CONSTRAINT "certification_additional_info_dossier_de_validation_file_i_fkey" FOREIGN KEY ("dossier_de_validation_file_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "certification_additional_info" ADD CONSTRAINT "certification_additional_info_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
