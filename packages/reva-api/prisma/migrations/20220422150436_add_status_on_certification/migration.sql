-- RECREATE VIEW
DROP MATERIALIZED VIEW "certification_search";

-- CreateEnum
CREATE TYPE "CertificationStatus" AS ENUM ('INACTIVE', 'SOON', 'AVAILABLE');

-- AlterTable
ALTER TABLE "certification" DROP COLUMN "is_active",
ADD COLUMN     "status" "CertificationStatus" NOT NULL DEFAULT E'INACTIVE';

CREATE MATERIALIZED VIEW "certification_search" AS
    SELECT certification.id,
        certification.slug,
        certification.status,
        setweight(to_tsvector(certification.slug::text), 'A'::"char") AS document
    FROM certification
    WHERE certification.status != E'INACTIVE'
    GROUP BY certification.id;
