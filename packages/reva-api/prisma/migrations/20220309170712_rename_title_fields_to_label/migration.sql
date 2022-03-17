/*
  Warnings:

  - You are about to drop the column `title` on the `certification` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `profession` table. All the data in the column will be lost.
  - Added the required column `label` to the `certification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `profession` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "certification" DROP COLUMN "title",
ADD COLUMN     "label" VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE "profession" DROP COLUMN "title",
ADD COLUMN     "label" VARCHAR(255) NOT NULL;
