-- CreateTable
CREATE TABLE "feasibility" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "candidacy_id" UUID NOT NULL,
    "feasibilityFileId" UUID NOT NULL,
    "otherFileId" UUID,
    "feasibility_file_sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    CONSTRAINT "feasibility_pkey" PRIMARY KEY ("id")
);
-- CreateTable
CREATE TABLE "file" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "mime_type" VARCHAR(255) NOT NULL,
    "file_content" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "feasibility_candidacy_id_key" ON "feasibility"("candidacy_id");
-- AddForeignKey
ALTER TABLE "feasibility"
ADD CONSTRAINT "feasibility_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "feasibility"
ADD CONSTRAINT "feasibility_feasibilityFileId_fkey" FOREIGN KEY ("feasibilityFileId") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- AddForeignKey
ALTER TABLE "feasibility"
ADD CONSTRAINT "feasibility_otherFileId_fkey" FOREIGN KEY ("otherFileId") REFERENCES "file"("id") ON DELETE
SET NULL ON UPDATE CASCADE;