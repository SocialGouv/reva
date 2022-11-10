-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "department_id" UUID;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE CASCADE ON UPDATE CASCADE;
