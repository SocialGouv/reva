-- AlterTable
ALTER TABLE "certification"
DROP COLUMN "status";

-- DropEnum
DROP TYPE "CertificationStatus";

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM (
  'BROUILLON',
  'A_VALIDER_PAR_CERTIFICATEUR',
  'VALIDE_PAR_CERTIFICATEUR',
  'INACTIVE'
);

-- AlterTable
ALTER TABLE "certification"
ADD COLUMN "status" "CertificationStatus" NOT NULL DEFAULT 'BROUILLON';

UPDATE "certification"
SET
  "status" = "status_v2"::VARCHAR::"CertificationStatus";

ALTER TABLE "certification"
DROP COLUMN "status_v2";
-- DropEnum
DROP TYPE "CertificationStatusV2";