-- AlterTable
ALTER TABLE "candidate" ADD COLUMN     "middle_names" VARCHAR(255);

UPDATE "candidate" SET "middle_names" = CONCAT("firstname2", ' ', "firstname3") WHERE "firstname2" IS NOT NULL AND "firstname3" IS NOT NULL;
UPDATE "candidate" SET "middle_names" = "firstname2" WHERE "firstname2" IS NOT NULL AND "firstname3" IS NULL;
UPDATE "candidate" SET "middle_names" = "firstname3" WHERE "firstname2" IS NULL AND "firstname3" IS NOT NULL;
UPDATE "candidate" SET "middle_names" = '' WHERE "firstname2" IS NULL AND "firstname3" IS NULL;
