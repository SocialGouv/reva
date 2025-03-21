-- DropForeignKey
ALTER TABLE "department"
DROP CONSTRAINT "department_region_id_fkey";

-- AlterTable
ALTER TABLE "department"
ALTER COLUMN "region_id"
DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "department" ADD CONSTRAINT "department_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region" ("id") ON DELETE NO ACTION ON UPDATE CASCADE;