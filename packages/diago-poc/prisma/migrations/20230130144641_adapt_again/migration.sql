/*
  Warnings:

  - You are about to drop the column `slug` on the `rome` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `rome` table. All the data in the column will be lost.
  - Added the required column `is_active` to the `rome` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rome" DROP COLUMN "slug",
DROP COLUMN "url",
ADD COLUMN     "is_active" BOOLEAN NOT NULL;
