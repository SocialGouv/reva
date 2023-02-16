/*
  Warnings:

  - You are about to alter the column `diagnosis_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `post_exam_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `individual_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `collective_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `basic_skills_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `certificate_skills_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `exam_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.
  - You are about to alter the column `mandatory_training_cost` on the `funding_request` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "funding_request" ALTER COLUMN "diagnosis_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "post_exam_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "individual_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "collective_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "basic_skills_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "certificate_skills_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "exam_cost" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "mandatory_training_cost" SET DATA TYPE DECIMAL(10,2);
