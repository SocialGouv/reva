-- CreateEnum
CREATE TYPE "CandidateTypology" AS ENUM ('NON_SPECIFIE', 'SALARIE_PRIVE', 'SALARIE_PUBLIC_HOSPITALIER', 'DEMANDEUR_EMPLOI', 'AIDANTS_FAMILIAUX', 'AUTRE');

-- AlterEnum
ALTER TYPE "CandidacyStatus" ADD VALUE 'PRIS_EN_CHARGE';

-- AlterTable
ALTER TABLE "candidacy" ADD COLUMN     "first_appointment_at" TIMESTAMPTZ(6),
ADD COLUMN     "number_of_appointment" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "typology" "CandidateTypology" NOT NULL DEFAULT E'NON_SPECIFIE',
ADD COLUMN     "typology_additional" TEXT,
ADD COLUMN     "was_present_at_appointment" BOOLEAN;
