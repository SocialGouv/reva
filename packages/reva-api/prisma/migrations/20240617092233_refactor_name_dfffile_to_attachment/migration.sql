/*
  Warnings:

  - You are about to drop the `dff_file` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "DFFAttachmentType" AS ENUM ('ID_CARD', 'EQUIVALENCE_OR_EXEMPTION_PROOF', 'TRAINING_CERTIFICATE', 'OTHER');

-- DropForeignKey
ALTER TABLE "dff_file" DROP CONSTRAINT "dff_file_dematerialized_feasibility_file_id_fkey";

-- DropForeignKey
ALTER TABLE "dff_file" DROP CONSTRAINT "dff_file_file_id_fkey";

-- DropTable
DROP TABLE "dff_file";

-- DropEnum
DROP TYPE "DFFFileType";

-- CreateTable
CREATE TABLE "dff_attachment" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "file_id" UUID NOT NULL,
    "type" "DFFAttachmentType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dematerialized_feasibility_file_id" UUID NOT NULL,

    CONSTRAINT "dff_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "dff_attachment_file_id_key" ON "dff_attachment"("file_id");

-- AddForeignKey
ALTER TABLE "dff_attachment" ADD CONSTRAINT "dff_attachment_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dff_attachment" ADD CONSTRAINT "dff_attachment_dematerialized_feasibility_file_id_fkey" FOREIGN KEY ("dematerialized_feasibility_file_id") REFERENCES "dematerialized_feasibility_file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
