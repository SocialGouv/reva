/*
  Warnings:

  - The primary key for the `competency_rome` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `rome_id` on the `competency_rome` table. All the data in the column will be lost.
  - The primary key for the `rome` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `rome_certification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `rome_code` to the `competency_rome` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `rome_id` on the `profession` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `rome_id` on the `rome_certification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "competency_rome" DROP CONSTRAINT "competency_rome_rome_id_fkey";

-- DropForeignKey
ALTER TABLE "profession" DROP CONSTRAINT "profession_rome_id_fkey";

-- DropForeignKey
ALTER TABLE "rome_certification" DROP CONSTRAINT "rome_certification_rome_id_fkey";

-- AlterTable
ALTER TABLE "competency_rome" DROP CONSTRAINT "competency_rome_pkey",
DROP COLUMN "rome_id",
ADD COLUMN     "rome_code" TEXT NOT NULL,
ADD CONSTRAINT "competency_rome_pkey" PRIMARY KEY ("competence_id", "rome_code");

-- AlterTable
ALTER TABLE "profession" DROP COLUMN "rome_id",
ADD COLUMN     "rome_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "rome" DROP CONSTRAINT "rome_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "rome_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "rome_certification" DROP CONSTRAINT "rome_certification_pkey",
DROP COLUMN "rome_id",
ADD COLUMN     "rome_id" INTEGER NOT NULL,
ADD CONSTRAINT "rome_certification_pkey" PRIMARY KEY ("certification_id", "rome_id");

-- AddForeignKey
ALTER TABLE "competency_rome" ADD CONSTRAINT "competency_rome_rome_code_fkey" FOREIGN KEY ("rome_code") REFERENCES "rome"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rome_certification" ADD CONSTRAINT "rome_certification_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profession" ADD CONSTRAINT "profession_rome_id_fkey" FOREIGN KEY ("rome_id") REFERENCES "rome"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
