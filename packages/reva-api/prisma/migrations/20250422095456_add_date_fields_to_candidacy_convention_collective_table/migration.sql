/*
  Warnings:

  - You are about to drop the `certification_vae_collective_on_certification_authority_on_cert` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority_on_cert" DROP CONSTRAINT "ccvco_certification_authority";

-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority_on_cert" DROP CONSTRAINT "ccvco_certification_authority_local_account";

-- AlterTable
ALTER TABLE "candidacy_convention_collective" ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "disabled_at" TIMESTAMPTZ(6),
ADD COLUMN     "updated_at" TIMESTAMPTZ(6);

-- DropTable
DROP TABLE "certification_vae_collective_on_certification_authority_on_cert";

-- CreateTable
CREATE TABLE "certification_vae_collective_on_certification_authority_on_certification_authority_local_account" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "certification_cohorte_vae_collective_certification_authority_id" UUID NOT NULL,
    "certification_authority_local_account_id" UUID NOT NULL,

    CONSTRAINT "certification_vae_collective_on_certification_authority_on_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority_on_certification_authority_local_account" ADD CONSTRAINT "ccvco_certification_authority" FOREIGN KEY ("certification_cohorte_vae_collective_certification_authority_id") REFERENCES "certification_vae_collective_on_certification_authority"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority_on_certification_authority_local_account" ADD CONSTRAINT "ccvco_certification_authority_local_account" FOREIGN KEY ("certification_authority_local_account_id") REFERENCES "certification_authority_local_account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
