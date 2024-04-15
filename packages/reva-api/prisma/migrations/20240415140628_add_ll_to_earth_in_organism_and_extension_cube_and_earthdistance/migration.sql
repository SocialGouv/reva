CREATE EXTENSION cube;
CREATE EXTENSION earthdistance;

ALTER TABLE "organism" ADD COLUMN     "ll_to_earth" TEXT;