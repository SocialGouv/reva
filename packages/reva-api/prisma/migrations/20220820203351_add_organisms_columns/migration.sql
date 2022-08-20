/*
  Warnings:

  - A unique constraint covering the columns `[label]` on the table `organism` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[contact_administratif]` on the table `organism` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adress` to the `organism` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `organism` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_administratif` to the `organism` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_commercial_email` to the `organism` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contact_commercial_name` to the `organism` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cp` to the `organism` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `organism` table without a default value. This is not possible if the table is not empty.
  - Added the required column `siret` to the `organism` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "organism" ADD COLUMN     "adress" TEXT NOT NULL,
ADD COLUMN     "city" VARCHAR(255) NOT NULL,
ADD COLUMN     "contact_administratif" VARCHAR(255) NOT NULL,
ADD COLUMN     "contact_commercial_email" TEXT NOT NULL,
ADD COLUMN     "contact_commercial_name" TEXT NOT NULL,
ADD COLUMN     "cp" VARCHAR(5) NOT NULL,
ADD COLUMN     "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "label" VARCHAR(255) NOT NULL,
ADD COLUMN     "siret" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "organism_label_key" ON "organism"("label");

-- CreateIndex
CREATE UNIQUE INDEX "organism_contact_administratif_key" ON "organism"("contact_administratif");
