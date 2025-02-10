-- CreateEnum
CREATE TYPE "CertificationJuryTypeOfModality" AS ENUM ('PRESENTIEL', 'A_DISTANCE', 'LES_DEUX');

-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "jury_type_mise_en_situation_professionnelle" "CertificationJuryTypeOfModality",
ADD COLUMN     "jury_type_soutenance_orale" "CertificationJuryTypeOfModality";
