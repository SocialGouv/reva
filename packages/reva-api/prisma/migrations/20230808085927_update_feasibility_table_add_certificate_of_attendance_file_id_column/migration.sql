-- AlterTable
ALTER TABLE "feasibility"
ADD COLUMN "certificate_of_attendance_file_id" UUID;
-- AddForeignKey
ALTER TABLE "feasibility"
ADD CONSTRAINT "feasibility_certificate_of_attendance_file_id_fkey" FOREIGN KEY ("certificate_of_attendance_file_id") REFERENCES "file"("id") ON DELETE
SET NULL ON UPDATE CASCADE;