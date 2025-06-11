/*
  Warnings:

  - You are about to drop the `certification_authority_log` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_authority_log" DROP CONSTRAINT "certification_authority_log_certification_authority_id_fkey";

-- DropForeignKey
ALTER TABLE "certification_authority_log" DROP CONSTRAINT "certification_authority_log_certification_authority_local__fkey";

-- DropTable
DROP TABLE "certification_authority_log";

-- DropEnum
DROP TYPE "CertificationAuthorityLogUserProfile";
