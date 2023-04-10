-- AlterTable
ALTER TABLE "candidate"
ADD COLUMN "department_id" UUID;
-- SET candidate department id to last updated candidacy department id or ile de france
UPDATE "candidate"
SET department_id = COALESCE(
    (
      SELECT candidacy.department_id
      FROM candidacy
      WHERE candidacy.candidate_id = candidate.id
        AND candidacy.created_at = (
          SELECT max(c.created_at)
          FROM candidacy c
          WHERE c.candidate_id = candidacy.candidate_id
        )
    ),
    (
      SELECT department.id
      FROM department
      WHERE department.code = '75'
    )
  );
-- Add not null constraint
ALTER TABLE "candidate"
alter column "department_id"
SET NOT NULL;
-- AddForeignKey
ALTER TABLE "candidate"
ADD CONSTRAINT "candidate_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;