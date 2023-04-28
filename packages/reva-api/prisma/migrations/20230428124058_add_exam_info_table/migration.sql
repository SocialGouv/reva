-- CreateEnum
CREATE TYPE "ExamResult" AS ENUM (
  'SUCCESS',
  'PARTIAL_SUCCESS',
  'PARTIAL_CERTIFICATION_SUCCESS',
  'FAILURE'
);
-- CreateTable
CREATE TABLE "exam_info" (
  "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
  "candidacy_id" UUID NOT NULL,
  "exam_result" "ExamResult",
  "estimated_exam_date" TIMESTAMP(3),
  "actual_exam_date" TIMESTAMP(3),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6),
  CONSTRAINT "exam_info_pkey" PRIMARY KEY ("id")
);
-- CreateIndex
CREATE UNIQUE INDEX "exam_info_candidacy_id_key" ON "exam_info"("candidacy_id");
-- AddForeignKey
ALTER TABLE "exam_info"
ADD CONSTRAINT "exam_info_candidacy_id_fkey" FOREIGN KEY ("candidacy_id") REFERENCES "candidacy"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
-- Create ExamInfo entries for existing candidacies
DO $$
DECLARE cid uuid;
BEGIN FOR cid IN
SELECT id
FROM candidacy
WHERE id NOT IN (
    SELECT candidacy_id
    FROM exam_info
  ) LOOP
INSERT INTO exam_info (id, candidacy_id)
VALUES (gen_random_uuid(), cid);
END LOOP;
END $$;