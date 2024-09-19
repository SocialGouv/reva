-- CreateTable
CREATE TABLE "organism_on_formacode" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "formacode_id" UUID NOT NULL,
    "organism_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "organism_on_formacode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organism_on_formacode_formacode_id_organism_id_key" ON "organism_on_formacode"("formacode_id", "organism_id");

-- AddForeignKey
ALTER TABLE "organism_on_formacode" ADD CONSTRAINT "organism_on_formacode_formacode_id_fkey" FOREIGN KEY ("formacode_id") REFERENCES "formacode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organism_on_formacode" ADD CONSTRAINT "organism_on_formacode_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE CASCADE ON UPDATE CASCADE;
