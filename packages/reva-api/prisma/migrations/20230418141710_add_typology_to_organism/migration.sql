/*
 Warnings:
 
 - Added the required column `typology` to the `organism` table without a default value. This is not possible if the table is not empty.
 
 */
-- AlterTable
ALTER TABLE "organism"
ADD COLUMN "typology" "OrganismTypology" NOT NULL DEFAULT 'experimentation';
ALTER TABLE "organism"
ALTER COLUMN "typology" DROP DEFAULT;