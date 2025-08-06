/*
  Warnings:

  - You are about to drop the `certification_vae_collective_on_certification_authority` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `certification_vae_collective_on_certification_authority_la` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority" DROP CONSTRAINT "ccvco_certification_authority";

-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority" DROP CONSTRAINT "ccvco_certification_cohorte";

-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority_la" DROP CONSTRAINT "ccvco_certification_authority";

-- DropForeignKey
ALTER TABLE "certification_vae_collective_on_certification_authority_la" DROP CONSTRAINT "ccvco_certification_authority_local_account";

-- DropTable
DROP TABLE "certification_vae_collective_on_certification_authority";

-- DropTable
DROP TABLE "certification_vae_collective_on_certification_authority_la";
