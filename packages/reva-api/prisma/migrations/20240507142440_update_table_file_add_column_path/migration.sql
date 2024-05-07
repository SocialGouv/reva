-- AlterTable
ALTER TABLE "file"
ADD COLUMN "path" TEXT NOT NULL DEFAULT 'TO_UPDATE';

update file f set path = (select candidacy_id from feasibility where feasibility_file_id=f.id limit 1)||'/'||f.id where f.id in (select feasibility.feasibility_file_id from feasibility);

update file f set path = (select candidacy_id from feasibility where "ID_file_id"=f.id limit 1)||'/'||f.id where f.id in (select feasibility."ID_file_id" from feasibility);

update file f set path = (select candidacy_id from feasibility where documentary_proof_file_id=f.id limit 1)||'/'||f.id where f.id in (select feasibility.documentary_proof_file_id from feasibility);

update file f set path = (select candidacy_id from feasibility where certificate_of_attendance_file_id=f.id limit 1)||'/'||f.id where f.id in (select feasibility.certificate_of_attendance_file_id from feasibility);

update file f set path = (select candidacy_id from feasibility where decision_file_id=f.id limit 1)||'/'||f.id where f.id in (select feasibility.decision_file_id from feasibility);

update file f set path = (select candidacy_id from dossier_de_validation where dossier_de_validation_file_id=f.id limit 1)||'/'||f.id where f.id in (select dossier_de_validation.dossier_de_validation_file_id from dossier_de_validation);

update file f set path = (select dossier_de_validation.candidacy_id from dossier_de_validation_other_files_on_file join dossier_de_validation on dossier_de_validation.id = dossier_de_validation_other_files_on_file.dossier_de_validation_id where dossier_de_validation_other_files_on_file.file_id=f.id limit 1)||'/'||f.id where f.id in (select file_id from dossier_de_validation_other_files_on_file);


update file f set path = (select candidacy_id from jury where jury.convocation_file_id=f.id limit 1)||'/'||f.id where f.id in (select jury.convocation_file_id from jury);

-- AlterTable
ALTER TABLE "file"
ALTER COLUMN "path" DROP NOT NULL;
