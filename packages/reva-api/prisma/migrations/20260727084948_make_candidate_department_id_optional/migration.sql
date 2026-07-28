-- DropForeignKey
ALTER TABLE "candidate" DROP CONSTRAINT "candidate_department_id_fkey";

-- AlterTable
ALTER TABLE "candidate" ALTER COLUMN "department_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "candidate" ADD CONSTRAINT "candidate_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
