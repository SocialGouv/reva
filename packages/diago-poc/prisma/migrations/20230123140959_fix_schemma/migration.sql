/*
  Warnings:

  - You are about to drop the column `is_active` on the `rome` table. All the data in the column will be lost.
  - You are about to drop the `skill_bloc` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "rome" DROP COLUMN "is_active";

-- DropTable
DROP TABLE "skill_bloc";

-- CreateTable
CREATE TABLE "competency" (
    "id" TEXT NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "bloc_id" VARCHAR(255) NOT NULL,
    "certification_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),

    CONSTRAINT "competency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competency_bloc_id_key" ON "competency"("bloc_id");

-- AddForeignKey
ALTER TABLE "competency" ADD CONSTRAINT "competency_certification_id_fkey" FOREIGN KEY ("certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
