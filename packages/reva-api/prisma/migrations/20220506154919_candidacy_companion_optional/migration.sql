-- DropForeignKey
ALTER TABLE "candidacy" DROP CONSTRAINT "candidacy_companion_id_fkey";

-- AlterTable
ALTER TABLE "candidacy" ALTER COLUMN "companion_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "candidacy" ADD CONSTRAINT "candidacy_companion_id_fkey" FOREIGN KEY ("companion_id") REFERENCES "companion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
