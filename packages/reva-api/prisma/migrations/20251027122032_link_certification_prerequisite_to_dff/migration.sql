-- AlterTable
ALTER TABLE "dff_prerequisite" ADD COLUMN     "certification_prerequisite_id" UUID;

-- AddForeignKey
ALTER TABLE "dff_prerequisite" ADD CONSTRAINT "dff_prerequisite_certification_prerequisite_id_fkey" FOREIGN KEY ("certification_prerequisite_id") REFERENCES "certification_prerequisite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
