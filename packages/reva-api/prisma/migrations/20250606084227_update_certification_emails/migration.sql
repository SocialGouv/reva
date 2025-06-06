-- AlterEnum
BEGIN;
CREATE TYPE "CertificationEmailType_new" AS ENUM ('CERTIFICATION_WILL_EXPIRE_IN_1_MONTH', 'CERTIFICATION_HAS_EXPIRED');
ALTER TABLE "certification_email" ALTER COLUMN "email_type" TYPE "CertificationEmailType_new" USING ("email_type"::text::"CertificationEmailType_new");
ALTER TYPE "CertificationEmailType" RENAME TO "CertificationEmailType_old";
ALTER TYPE "CertificationEmailType_new" RENAME TO "CertificationEmailType";
DROP TYPE "CertificationEmailType_old";
COMMIT;
