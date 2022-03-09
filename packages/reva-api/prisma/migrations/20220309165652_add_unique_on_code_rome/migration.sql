/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `rome` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "rome_code_key" ON "rome"("code");
