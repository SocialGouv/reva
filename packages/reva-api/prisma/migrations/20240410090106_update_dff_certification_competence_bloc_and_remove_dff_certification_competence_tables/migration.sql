DELETE FROM "dff_certification_competence";
DELETE FROM "dff_certification_competence_bloc";

-- DropForeignKey
ALTER TABLE "dff_certification_competence" DROP CONSTRAINT "dff_certification_competence_bloc_id_fkey";

-- DropIndex
DROP INDEX "dff_certification_competence_bloc_code_key";

-- AlterTable
ALTER TABLE "dff_certification_competence_bloc" DROP COLUMN "code",
DROP COLUMN "is_optional",
DROP COLUMN "label",
ADD COLUMN     "certification_competence_bloc_id" UUID NOT NULL;

-- DropTable
DROP TABLE "dff_certification_competence";

-- AddForeignKey
ALTER TABLE "dff_certification_competence_bloc" ADD CONSTRAINT "dff_certification_competence_bloc_certification_competence_fkey" FOREIGN KEY ("certification_competence_bloc_id") REFERENCES "certification_competence_bloc"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
