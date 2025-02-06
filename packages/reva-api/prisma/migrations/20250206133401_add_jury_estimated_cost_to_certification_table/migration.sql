-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "jury_estimated_cost" DECIMAL(10,2);

UPDATE certification SET jury_estimated_cost = '0.00' WHERE visible = true;
