-- CreateTable
CREATE TABLE "certification_additional_info_additional_document" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "file_id" UUID NOT NULL,
    "certificationAdditionalInfoId" UUID NOT NULL,

    CONSTRAINT "certification_additional_info_additional_document_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certification_additional_info_additional_document" ADD CONSTRAINT "certification_additional_info_additional_document_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "certification_additional_info_additional_document" ADD CONSTRAINT "certification_additional_info_additional_document_certific_fkey" FOREIGN KEY ("certificationAdditionalInfoId") REFERENCES "certification_additional_info"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
