/*
  Warnings:

  - You are about to alter the column `name` on the `companion` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - A unique constraint covering the columns `[name]` on the table `companion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order` to the `goal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "companion" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "goal" ADD COLUMN     "order" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "companion_name_key" ON "companion"("name");
