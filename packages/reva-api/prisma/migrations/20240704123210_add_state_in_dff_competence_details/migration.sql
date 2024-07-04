-- CreateEnum
CREATE TYPE "DFFCertificationCompetenceDetailsState" AS ENUM ('YES', 'NO', 'PARTIALLY');

-- AlterTable
ALTER TABLE "dff_certification_competence_details" ADD COLUMN     "state" "DFFCertificationCompetenceDetailsState" NOT NULL DEFAULT 'YES';
