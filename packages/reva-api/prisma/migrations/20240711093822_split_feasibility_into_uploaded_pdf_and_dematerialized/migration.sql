-- DropForeignKey
ALTER TABLE "dematerialized_feasibility_file" DROP CONSTRAINT "dematerialized_feasibility_file_certification_authority_id_fkey";

-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_ID_file_id_fkey";

-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_certificate_of_attendance_file_id_fkey";

-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_documentary_proof_file_id_fkey";

-- DropForeignKey
ALTER TABLE "feasibility" DROP CONSTRAINT "feasibility_feasibility_file_id_fkey";

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" 
ADD COLUMN  "feasibility_id" UUID;

UPDATE "dematerialized_feasibility_file" df
SET "feasibility_id" = f."id"
FROM "feasibility" f
WHERE f."candidacy_id" = df."candidacy_id" AND f."is_active" = true AND df."feasibility_id" IS NULL;

-- DropForeignKey
ALTER TABLE "dematerialized_feasibility_file" DROP CONSTRAINT "dematerialized_feasibility_file_candidacy_id_fkey";

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" 
DROP COLUMN "candidacy_id",
DROP COLUMN "aap_decision_sent_at",
DROP COLUMN "certification_authority_id",
DROP COLUMN "sent_to_certification_authority_at";

-- AlterTable
ALTER TABLE "dematerialized_feasibility_file" ALTER COLUMN "feasibility_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "feasibility" 
ADD COLUMN     "dematerialized_feasibility_file_id" UUID,
ADD COLUMN     "feasibility_format" "FeasibilityFormat" NOT NULL DEFAULT 'UPLOADED_PDF',
ADD COLUMN     "feasibility_uploaded_pdf_id" UUID;

-- CreateTable
CREATE TABLE "feasibility_uploaded_pdf" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "feasibility_file_id" UUID NOT NULL,
    "ID_file_id" UUID,
    "documentary_proof_file_id" UUID,
    "certificate_of_attendance_file_id" UUID,
    "feasibility_id" UUID NOT NULL,

    CONSTRAINT "feasibility_uploaded_pdf_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feasibility_uploaded_pdf_feasibility_id_key" ON "feasibility_uploaded_pdf"("feasibility_id");

-- CreateIndex
CREATE UNIQUE INDEX "dematerialized_feasibility_file_feasibility_id_key" ON "dematerialized_feasibility_file"("feasibility_id");

INSERT INTO "feasibility_uploaded_pdf" (
    "feasibility_file_id", 
    "ID_file_id", 
    "documentary_proof_file_id", 
    "certificate_of_attendance_file_id", 
    "feasibility_id"
)
SELECT 
    "feasibility_file_id", 
    "ID_file_id", 
    "documentary_proof_file_id", 
    "certificate_of_attendance_file_id", 
    "id" 
FROM "feasibility";

-- AddForeignKey
ALTER TABLE "feasibility_uploaded_pdf" ADD CONSTRAINT "feasibility_uploaded_pdf_feasibility_file_id_fkey" FOREIGN KEY ("feasibility_file_id") REFERENCES "file"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feasibility_uploaded_pdf" ADD CONSTRAINT "feasibility_uploaded_pdf_ID_file_id_fkey" FOREIGN KEY ("ID_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feasibility_uploaded_pdf" ADD CONSTRAINT "feasibility_uploaded_pdf_documentary_proof_file_id_fkey" FOREIGN KEY ("documentary_proof_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feasibility_uploaded_pdf" ADD CONSTRAINT "feasibility_uploaded_pdf_certificate_of_attendance_file_id_fkey" FOREIGN KEY ("certificate_of_attendance_file_id") REFERENCES "file"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feasibility_uploaded_pdf" ADD CONSTRAINT "feasibility_uploaded_pdf_feasibility_id_fkey" FOREIGN KEY ("feasibility_id") REFERENCES "feasibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dematerialized_feasibility_file" ADD CONSTRAINT "dematerialized_feasibility_file_feasibility_id_fkey" FOREIGN KEY ("feasibility_id") REFERENCES "feasibility"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "feasibility" 
DROP COLUMN "ID_file_id",
DROP COLUMN "certificate_of_attendance_file_id",
DROP COLUMN "documentary_proof_file_id",
DROP COLUMN "feasibility_file_id";

UPDATE "feasibility" f
SET "dematerialized_feasibility_file_id" = df."id"
FROM "dematerialized_feasibility_file" df
WHERE f."id" = df."feasibility_id" AND f."dematerialized_feasibility_file_id" IS NULL;

UPDATE "feasibility" f
SET "feasibility_uploaded_pdf_id" = fup."id"
FROM "feasibility_uploaded_pdf" fup
WHERE f."id" = fup."feasibility_id" AND f."feasibility_uploaded_pdf_id" IS NULL;

UPDATE "feasibility" SET "feasibility_format" = 'UPLOADED_PDF' WHERE "feasibility_uploaded_pdf_id" IS NOT NULL;
UPDATE "feasibility" SET "feasibility_format" = 'DEMATERIALIZED' WHERE "dematerialized_feasibility_file_id" IS NOT NULL;

-- AlterTable
ALTER TABLE "feasibility" ALTER COLUMN "feasibility_format" SET NOT NULL;
-- AlterTable
ALTER TABLE "feasibility" ALTER COLUMN "certification_authority_id" DROP NOT NULL;