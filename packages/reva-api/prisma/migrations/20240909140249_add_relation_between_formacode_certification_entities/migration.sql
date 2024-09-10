-- CreateTable
CREATE TABLE "certification_on_formacode" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "formacode_id" UUID NOT NULL,
    "certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_on_formacode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_on_formacode_formacode_id_certification_id_key" ON "certification_on_formacode"("formacode_id", "certification_id");

-- AddForeignKey
ALTER TABLE "certification_on_formacode" ADD CONSTRAINT "certification_on_formacode_formacode_id_fkey" FOREIGN KEY ("formacode_id") REFERENCES "formacode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_on_formacode" ADD CONSTRAINT "certification_on_formacode_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
