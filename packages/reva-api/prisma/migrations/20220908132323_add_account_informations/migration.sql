/*
  Warnings:

  - You are about to drop the column `keycloak_sub` on the `candidacy` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[keycloak_id]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `keycloak_id` to the `account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organism_id` to the `account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "account" ADD COLUMN     "email" VARCHAR(255) NOT NULL,
ADD COLUMN     "firstname" VARCHAR(255),
ADD COLUMN     "keycloak_id" UUID NOT NULL,
ADD COLUMN     "lastname" VARCHAR(255),
ADD COLUMN     "organism_id" UUID NOT NULL;

-- AlterTable
ALTER TABLE "candidacy" DROP COLUMN "keycloak_sub";

-- CreateIndex
CREATE UNIQUE INDEX "account_email_key" ON "account"("email");

-- CreateIndex
CREATE UNIQUE INDEX "account_keycloak_id_key" ON "account"("keycloak_id");

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_organism_id_fkey" FOREIGN KEY ("organism_id") REFERENCES "organism"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
