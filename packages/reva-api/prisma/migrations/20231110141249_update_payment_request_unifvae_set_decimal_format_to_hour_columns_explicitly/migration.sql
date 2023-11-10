-- AlterTable
ALTER TABLE "payment_request_unifvae"
ALTER COLUMN "individual_effective_hour_count"
SET DATA TYPE DECIMAL(10, 2),
  ALTER COLUMN "collective_effective_hour_count"
SET DATA TYPE DECIMAL(10, 2),
  ALTER COLUMN "mandatory_training_effective_hour_count"
SET DATA TYPE DECIMAL(10, 2),
  ALTER COLUMN "basic_skills_effective_hour_count"
SET DATA TYPE DECIMAL(10, 2),
  ALTER COLUMN "certificate_skills_effective_hour_count"
SET DATA TYPE DECIMAL(10, 2),
  ALTER COLUMN "other_training_effective_hour_count"
SET DATA TYPE DECIMAL(10, 2);