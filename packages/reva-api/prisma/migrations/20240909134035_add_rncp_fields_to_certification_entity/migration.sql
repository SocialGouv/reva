-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "rncp_delivery_deadline" TIMESTAMPTZ(6),
ADD COLUMN     "rncp_expires_at" TIMESTAMPTZ(6),
ADD COLUMN     "rncp_label" VARCHAR(255),
ADD COLUMN     "rncp_level" INTEGER,
ADD COLUMN     "rncp_type_diplome" VARCHAR(255);
