-- AlterTable
ALTER TABLE "feasibility" ADD COLUMN     "certification_authority_id" UUID;

-- AddForeignKey
ALTER TABLE "feasibility" ADD CONSTRAINT "feasibility_certification_authority_id_fkey" FOREIGN KEY ("certification_authority_id") REFERENCES "certification_authority"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Fill certification_authority_id to existing feasibilities
UPDATE feasibility
SET certification_authority_id = authority.id
FROM candidacy,
     candidacy_region_certification,
     certification_authority authority,
     certification_authority_on_department authority_department,
     certification_authority_on_certification authority_certification
WHERE
        candidacy.id = feasibility.candidacy_id
  AND authority_department.department_id = candidacy.department_id
  AND candidacy_region_certification.candidacy_id = candidacy.id
  AND candidacy_region_certification.is_active = True
  AND authority_certification.certification_id = candidacy_region_certification.certification_id
  AND authority.id = authority_certification.certification_authority_id
  AND authority.id = authority_department.certification_authority_id
  AND feasibility.certification_authority_id IS NULL;