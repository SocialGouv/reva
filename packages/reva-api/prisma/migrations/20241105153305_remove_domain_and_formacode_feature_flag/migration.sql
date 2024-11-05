/*
  Warnings:

  - You are about to drop the `certification_on_domaine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `domaine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `maison_mere_aap_on_domaine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `organism_on_domaine` table. If the table is not empty, all the data it contains will be lost.

*/

-- DropView
DROP VIEW "available_certification";

-- DropView
DROP VIEW "active_organism_by_available_certification";

-- DropForeignKey
ALTER TABLE "certification_on_domaine" DROP CONSTRAINT "certification_on_domaine_certification_id_fkey";

-- DropForeignKey
ALTER TABLE "certification_on_domaine" DROP CONSTRAINT "certification_on_domaine_domaine_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_on_domaine" DROP CONSTRAINT "organism_on_domaine_domaine_id_fkey";

-- DropForeignKey
ALTER TABLE "organism_on_domaine" DROP CONSTRAINT "organism_on_domaine_organism_id_fkey";

-- DropTable
DROP TABLE "certification_on_domaine";

-- DropTable
DROP TABLE "domaine";

-- DropTable
DROP TABLE "maison_mere_aap_on_domaine";

-- DropTable
DROP TABLE "organism_on_domaine";

DELETE FROM "features" WHERE key = 'AAP_SETTINGS_FORMACODE';