-- AlterTable
ALTER TABLE "funding_request_unifvae"
ALTER COLUMN "individual_hour_count"
SET DATA TYPE DECIMAL(5, 1),
  ALTER COLUMN "collective_hour_count"
SET DATA TYPE DECIMAL(5, 1),
  ALTER COLUMN "basic_skills_hour_count"
SET DATA TYPE DECIMAL(5, 1),
  ALTER COLUMN "mandatory_training_hour_count"
SET DATA TYPE DECIMAL(5, 1),
  ALTER COLUMN "certificate_skills_hour_count"
SET DATA TYPE DECIMAL(5, 1),
  ALTER COLUMN "other_training_hour_count"
SET DEFAULT 0,
  ALTER COLUMN "other_training_hour_count"
SET DATA TYPE DECIMAL(5, 1);