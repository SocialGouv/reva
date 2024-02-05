import { FeasibilityStatus } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { prismaClient } from "../../../prisma/client";
import { getAccountById } from "../../account/features/getAccount";
import { updateCandidacyStatus } from "../../candidacy/features/updateCandidacyStatus";
import { getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment";
import { FileService, UploadedFile } from "../../shared/file";
import { sendNewDVToCertificationAuthoritiesEmail } from "../mails";
import { sendDVSentToCandidateEmail } from "../mails/sendDVSentToCandidateEmail";

export const sendDossierDeValidation = async ({
  candidacyId,
  dossierDeValidationFile,
  dossierDeValidationOtherFiles,
}: {
  candidacyId: string;
  dossierDeValidationFile: UploadedFile;
  dossierDeValidationOtherFiles: UploadedFile[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      candidacyDropOut: true,
      candidacyStatuses: { where: { isActive: true } },
      Feasibility: { where: { isActive: true } },
      department: true,
      certificationsAndRegions: {
        where: { isActive: true },
        include: { certification: true },
      },
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }
  if (candidacy.candidacyDropOut) {
    throw new Error("La candidature a été abandonnée");
  }
  if (candidacy.candidacyStatuses?.[0]?.status === "ARCHIVE") {
    throw new Error("La candidature a été supprimée");
  }
  if (
    !candidacy.Feasibility[0]?.isActive &&
    candidacy.Feasibility[0]?.decision !== FeasibilityStatus.ADMISSIBLE
  ) {
    throw new Error(
      "Le dossier de faisabilité n'est pas actif ou n'est pas recevable",
    );
  }

  if (
    !["DEMANDE_FINANCEMENT_ENVOYE", "DOSSIER_DE_VALIDATION_SIGNALE"].includes(
      candidacy.candidacyStatuses?.[0]?.status,
    )
  ) {
    throw new Error(
      "Le statut de la candidature doit être DEMANDE_FINANCEMENT_ENVOYE ou DOSSIER_FAISABILITE_INCOMPLET ",
    );
  }
  const dossierDeValidationFileId = uuidV4();
  await uploadFile({
    candidacyId,
    fileUuid: dossierDeValidationFileId,
    file: dossierDeValidationFile,
  });

  const dossierDeValidationOtherFilesWithIds: {
    file: UploadedFile;
    id: string;
  }[] = dossierDeValidationOtherFiles.map((f) => ({ id: uuidV4(), file: f }));

  for (const d of dossierDeValidationOtherFilesWithIds) {
    await uploadFile({
      candidacyId,
      fileUuid: d.id,
      file: d.file,
    });
  }

  await prismaClient.file.createMany({
    data: dossierDeValidationOtherFilesWithIds.map((d) => ({
      id: d.id,
      mimeType: d.file.mimetype,
      name: d.file.filename,
    })),
  });

  await prismaClient.dossierDeValidation.updateMany({
    where: { candidacyId },
    data: { isActive: false },
  });

  const dossierDeValidation = await prismaClient.dossierDeValidation.create({
    data: {
      dossierDeValidationSentAt: new Date(),
      candidacy: { connect: { id: candidacyId } },
      dossierDeValidationFile: {
        create: {
          name: dossierDeValidationFile.filename,
          mimeType: dossierDeValidationFile.mimetype,
          id: dossierDeValidationFileId,
        },
      },
      dossierDeValidationOtherFiles: {
        createMany: {
          data: dossierDeValidationOtherFilesWithIds.map((fileWithId) => ({
            fileId: fileWithId.id,
          })),
        },
      },
      certificationAuthority: {
        connect: { id: candidacy.Feasibility[0].certificationAuthorityId },
      },
    },
    include: {
      certificationAuthority: true,
    },
  });

  await updateCandidacyStatus({
    candidacyId,
    status: "DOSSIER_DE_VALIDATION_ENVOYE",
  });

  const candidacyCertificationId =
    candidacy?.certificationsAndRegions?.[0]?.certificationId;
  const candidacyDepartmentId = candidacy.departmentId;

  if (candidacyCertificationId && candidacyDepartmentId) {
    const certificationAuthorityLocalAccounts =
      await getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment(
        {
          certificationAuthorityId:
            dossierDeValidation.certificationAuthorityId,
          certificationId: candidacyCertificationId,
          departmentId: candidacyDepartmentId,
        },
      );
    const certificationAuthority = dossierDeValidation.certificationAuthority;
    const emails = [];
    if (certificationAuthority?.contactEmail) {
      emails.push(certificationAuthority?.contactEmail);
    }
    for (const cala of certificationAuthorityLocalAccounts) {
      const account = await getAccountById({ id: cala.accountId });
      emails.push(account.email);
    }
    if (emails.length) {
      sendNewDVToCertificationAuthoritiesEmail({
        emails,
        dvId: dossierDeValidation.id,
      });
    }
  }

  if (candidacy?.email) {
    sendDVSentToCandidateEmail({ email: candidacy.email });
  }

  return dossierDeValidation;
};

const uploadFile = ({
  candidacyId,
  fileUuid,
  file,
}: {
  candidacyId: string;
  fileUuid: string;
  file: UploadedFile;
}) =>
  FileService.getInstance().uploadFile(
    {
      fileKeyPath: `${candidacyId}/${fileUuid}`,
      fileType: file.mimetype,
    },
    file._buf,
  );
