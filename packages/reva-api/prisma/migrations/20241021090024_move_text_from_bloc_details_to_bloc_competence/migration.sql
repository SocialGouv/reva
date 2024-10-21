-- AlterTable
ALTER TABLE "dff_certification_competence_bloc" ADD COLUMN     "text" TEXT;

-- AlterTable
ALTER TABLE "dff_certification_competence_details" ALTER COLUMN "text" DROP NOT NULL;
