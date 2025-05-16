/*
  Warnings:

  - You are about to drop the column `is_active` on the `candidacy_candidacy_status` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "candidacy_candidacy_status_candidacy_id_is_active_idx";

-- DropIndex
DROP INDEX "candidacy_candidacy_status_candidacy_id_status_is_active_idx";

-- DropIndex
DROP INDEX "candidacy_candidacy_status_status_is_active_idx";

-- AlterTable
ALTER TABLE "candidacy_candidacy_status" DROP COLUMN "is_active";

-- CreateIndex
CREATE INDEX "candidacy_candidacy_status_status_idx" ON "candidacy_candidacy_status"("status");
