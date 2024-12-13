-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "rncp_effective_at" TIMESTAMPTZ(6),
ADD COLUMN     "rncp_published_at" TIMESTAMPTZ(6);
