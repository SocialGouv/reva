-- CreateEnum
CREATE TYPE "TypeForfaitJuryFundingRequestUnifvae" AS ENUM ('FORFAIT_UNIQUE', 'FORFAIT_SEPARE_FAISABILITE_ET_ENTRETIEN_POST_JURY');

-- AlterTable
ALTER TABLE "funding_request_unifvae" ADD COLUMN     "type_forfait_jury" "TypeForfaitJuryFundingRequestUnifvae" NOT NULL DEFAULT 'FORFAIT_SEPARE_FAISABILITE_ET_ENTRETIEN_POST_JURY';
