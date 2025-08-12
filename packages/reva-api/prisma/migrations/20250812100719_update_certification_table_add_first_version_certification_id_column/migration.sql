-- AlterTable
ALTER TABLE "certification" ADD COLUMN     "first_version_certification_id" UUID;

-- AddForeignKey
ALTER TABLE "certification" ADD CONSTRAINT "certification_first_version_certification_id_fkey" FOREIGN KEY ("first_version_certification_id") REFERENCES "certification"("id") ON DELETE RESTRICT ON UPDATE CASCADE;



DO $$
DECLARE 
	certId uuid;
	previousVersionOfCertificationId uuid;
 	currentFirstVersionCandidateId uuid;
 	nextFirstVersionCandidateId uuid;
BEGIN FOR certId,previousVersionOfCertificationId IN
SELECT id,previous_version_certification_id
FROM certification LOOP
  IF previousVersionOfCertificationId IS NULL THEN
    UPDATE "certification" SET "first_version_certification_id" = certId WHERE certification.id = certId;
  ELSE
    currentFirstVersionCandidateId := NULL;
    nextFirstVersionCandidateId := previousVersionOfCertificationId;
    WHILE nextFirstVersionCandidateId IS NOT NULL LOOP
        currentFirstVersionCandidateId := nextFirstVersionCandidateId;
        nextFirstVersionCandidateId := (SELECT previous_version_certification_id FROM certification WHERE id = currentFirstVersionCandidateId);
    END LOOP;
    UPDATE "certification" SET "first_version_certification_id" = currentFirstVersionCandidateId WHERE certification.id = certId;
  END IF;
END LOOP;
END $$;


ALTER TABLE "certification" ALTER COLUMN     "first_version_certification_id" SET NOT NULL;
