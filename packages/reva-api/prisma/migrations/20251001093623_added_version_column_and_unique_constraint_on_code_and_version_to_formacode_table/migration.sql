/*
  Warnings:

  - A unique constraint covering the columns `[code,version]` on the table `formacode` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "formacode" DROP CONSTRAINT "formacode_parent_code_fkey";

-- DropIndex
DROP INDEX "formacode_code_key";

-- AlterTable
ALTER TABLE "formacode" ADD COLUMN     "version" TEXT;

-- Update data
UPDATE "formacode" SET "version" = 'v13';

-- AlterTable
ALTER TABLE "formacode" ALTER COLUMN "version" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "formacode_code_version_key" ON "formacode"("code", "version");

-- AddForeignKey
ALTER TABLE "formacode" ADD CONSTRAINT "formacode_parent_code_version_fkey" FOREIGN KEY ("parent_code", "version") REFERENCES "formacode"("code", "version") ON DELETE NO ACTION ON UPDATE NO ACTION;
