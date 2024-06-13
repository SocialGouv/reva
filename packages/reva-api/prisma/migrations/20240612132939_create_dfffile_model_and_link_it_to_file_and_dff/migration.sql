-- CreateEnum
CREATE TYPE "DFFFileType" AS ENUM ('ID_CARD', 'EQUIVALENCE_OR_EXEMPTION_PROOF', 'TRAINING_CERTIFICATE', 'OTHER');

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ADD COLUMN     "attachments_part_complete" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "dff_file" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "file_id" UUID NOT NULL,
    "type" "DFFFileType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dematerialized_feasibility_file_id" UUID NOT NULL,

    CONSTRAINT "dff_file_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dff_file_file_id_key" ON "dff_file"("file_id");

-- AddForeignKey
ALTER TABLE "dff_file" ADD CONSTRAINT "dff_file_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_file" ADD CONSTRAINT "dff_file_dematerialized_feasibility_file_id_fkey" FOREIGN KEY ("dematerialized_feasibility_file_id") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
