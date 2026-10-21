/*
Warnings:

- Made the column `candidate_id` on table `candidacy` required. This step will fail if there are existing NULL values in that column.

 */
-- AlterTable
DELETE FROM candidacy
WHERE
  candidate_id is null;

ALTER TABLE "candidacy"
ALTER COLUMN "candidate_id"
SET
  NOT NULL;