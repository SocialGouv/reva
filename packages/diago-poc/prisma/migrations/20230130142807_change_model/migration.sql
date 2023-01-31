/*
  Warnings:

  - The primary key for the `competency` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bloc_id` on the `competency` table. All the data in the column will be lost.
  - You are about to drop the column `certification_rncp_id` on the `competency` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `competency` table. All the data in the column will be lost.
  - The primary key for the `rome` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `rome` table. All the data in the column will be lost.
  - The primary key for the `rome_certification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[code_ogr]` on the table `competency` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code_ogr` to the `competency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `is_active` to the `competency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label_type_competence` to the `competency` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "competency" DROP CONSTRAINT "competency_certification_rncp_id_fkey";

-- DropForeignKey
ALTER TABLE "profession" DROP CONSTRAINT "profession_rome_id_fkey";

-- DropForeignKey
ALTER TABLE "rome_certification" DROP CONSTRAINT "rome_certification_rome_id_fkey";

-- DropIndex
DROP INDEX "competency_bloc_id_key";

-- AlterTable
ALTER TABLE "competency" DROP CONSTRAINT "competency_pkey",
DROP COLUMN "bloc_id",
DROP COLUMN "certification_rncp_id",
DROP COLUMN "id",
ADD COLUMN     "code_ogr" VARCHAR(255) NOT NULL,
ADD COLUMN     "is_active" BOOLEAN NOT NULL,
ADD COLUMN     "label_type_competence" TEXT NOT NULL,
ADD CONSTRAINT "competency_pkey" PRIMARY KEY ("code_ogr");

-- AlterTable
ALTER TABLE "profession" ALTER COLUMN "rome_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "rome" DROP CONSTRAINT "rome_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "rome_pkey" PRIMARY KEY ("code");

-- AlterTable
ALTER TABLE "rome_certification" DROP CONSTRAINT "rome_certification_pkey",
ALTER COLUMN "rome_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "rome_certification_pkey" PRIMARY KEY ("certification_id", "rome_id");

-- CreateTable
CREATE TABLE "competency_rome" (
    "competence_id" TEXT NOT NULL,
    "rome_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "competency_rome_pkey" PRIMARY KEY ("competence_id","rome_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competency_code_ogr_key" ON "competency"("code_ogr");

-- AddForeignKey
ALTER TABLE "competency_rome" ADD CONSTRAINT "competency_rome_competence_id_fkey" FOREIGN KEY ("competence_id") REFERENCES "competency"("code_ogr") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_rome" ADD CONSTRAINT "competency_rome_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rome_certification" ADD CONSTRAINT "rome_certification_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profession" ADD CONSTRAINT "profession_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("code") ON DELETE RESTRICT ON UPDATE CASCADE;
