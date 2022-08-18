/*
  Warnings:

  - You are about to alter the column `code` on the `region` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `VarChar(3)`.
  - A unique constraint covering the columns `[code]` on the table `region` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "region" ALTER COLUMN "code" SET DATA TYPE VARCHAR(3);

-- CreateIndex
CREATE UNIQUE INDEX "region_code_key" ON "region"("code");
