-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "reorientation_reason_id" UUID;

-- CreateTable
CREATE TABLE "reorientation_reason" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "label" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "reorientation_reason_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "reorientation_reason_label_key" ON "reorientation_reason"("label");

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_reorientation_reason_id_fkey" FOREIGN KEY ("reorientation_reason_id") REFERENCES "reorientation_reason"("id") ON DELETE CASCADE ON UPDATE CASCADE;
