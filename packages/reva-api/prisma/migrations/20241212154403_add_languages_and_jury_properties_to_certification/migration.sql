-- CreateEnum
CREATE TYPE "CertificationJuryModality" AS ENUM ('PRESENTIEL', 'A_DISTANCE', 'MISE_EN_SITUATION_PROFESSIONNELLE', 'ORAL');

-- CreateEnum
CREATE TYPE "CertificationJuryFrequency" AS ENUM ('MONTHLY', 'TRIMESTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "jury_frequency" "CertificationJuryFrequency",
ADD COLUMN     "jury_frequency_other" TEXT,
ADD COLUMN     "jury_modalities" "CertificationJuryModality"[] DEFAULT ARRAY[]::"CertificationJuryModality"[],
ADD COLUMN     "jury_place" TEXT,
ADD COLUMN     "languages" INTEGER;
