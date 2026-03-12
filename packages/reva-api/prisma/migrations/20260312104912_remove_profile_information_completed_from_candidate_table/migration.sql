/*
  Warnings:

  - You are about to drop the column `profile_information_completed` on the `candidate` table. All the data in the column will be lost.
  - You are about to drop the `certification_authority_on_certification_on_parcours_certificat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_authority_on_certification_on_parcours_certificat" DROP CONSTRAINT "cert_auth_on_cert_on_parcours";

-- DropForeignKey
ALTER TABLE "certification_authority_on_certification_on_parcours_certificat" DROP CONSTRAINT "certification_authority_on_certification_on_parcours_certi_fkey";

-- AlterTable
ALTER TABLE "candidate" DROP COLUMN "profile_information_completed";

-- DropTable
DROP TABLE "certification_authority_on_certification_on_parcours_certificat";

-- CreateTable
CREATE TABLE "certification_authority_on_certification_on_parcours_certification" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_authority_on_certification_id" UUID NOT NULL,
    "parcours_certification_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "certification_authority_on_certification_on_parcours_certi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "certification_authority_on_certification_on_parcours_certif_key" ON "certification_authority_on_certification_on_parcours_certification"("certification_authority_on_certification_id", "parcours_certification_id");

-- AddForeignKey
ALTER TABLE "certification_authority_on_certification_on_parcours_certification" ADD CONSTRAINT "cert_auth_on_cert_on_parcours" FOREIGN KEY ("certification_authority_on_certification_id") REFERENCES "certification_authority_on_certification"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_authority_on_certification_on_parcours_certification" ADD CONSTRAINT "certification_authority_on_certification_on_parcours_certi_fkey" FOREIGN KEY ("parcours_certification_id") REFERENCES "parcours_certification"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
