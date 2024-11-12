-- CreateEnum
CREATE TYPE "CertificationStatusV2" AS ENUM ('BROUILLON', 'A_VALIDER_PAR_CERTIFICATEUR', 'VALIDE_PAR_CERTIFICATEUR', 'INACTIVE');

-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "status_v2" "CertificationStatusV2" DEFAULT 'BROUILLON';

UPDATE "certification" SET "status_v2" = 'BROUILLON' WHERE STATUS = 'SOON';
UPDATE "certification" SET "status_v2" = 'INACTIVE' WHERE STATUS = 'INACTIVE';
UPDATE "certification" SET "status_v2" = 'VALIDE_PAR_CERTIFICATEUR' WHERE STATUS = 'AVAILABLE';

-- AlterTable
ALTER TABLE "certification" ALTER COLUMN     "status_v2" SET NOT NULL;
