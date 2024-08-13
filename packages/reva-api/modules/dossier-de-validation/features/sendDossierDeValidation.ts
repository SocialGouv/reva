import { CandidacyStatusStep, FeasibilityStatus } from "@prisma/client";
import { v4 as uuidV4 } from "uuid";

import { prismaClient } from "../../../prisma/client";
import { getAccountById } from "../../account/features/getAccount";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCandidacyStatus } from "../../candidacy/features/updateCandidacyStatus";
import { getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment } from "../../certification-authority/features/getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment";
import { UploadedFile, uploadFileToS3 } from "../../shared/file";
import { sendNewDVToCertificationAuthoritiesEmail } from "../emails";
import { sendDVSentToCandidateEmail } from "../emails/sendDVSentToCandidateEmail";

export const sendDossierDeValidation = async ({
  candidacyId,
  dossierDeValidationFile,
  dossierDeValidationOtherFiles,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  dossierDeValidationFile: UploadedFile;
  dossierDeValidationOtherFiles: UploadedFile[];
  userKeycloakId?: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    include: {
      candidacyDropOut: true,
      candidacyStatuses: { where: { isActive: true } },
      candidate: true,
      Feasibility: { where: { isActive: true } },
      department: true,
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
  if (candidacy.Feasibility?.[0]?.decision !== FeasibilityStatus.ADMISSIBLE) {
    throw new Error("Le dossier de faisabilité n'est pas recevable");
  }

  const validStatuses: CandidacyStatusStep[] =
    candidacy.financeModule === "hors_plateforme"
      ? [
          "DOSSIER_FAISABILITE_RECEVABLE",
          "DOSSIER_FAISABILITE_NON_RECEVABLE",
          "DOSSIER_DE_VALIDATION_SIGNALE",
        ]
      : ["DEMANDE_FINANCEMENT_ENVOYE", "DOSSIER_DE_VALIDATION_SIGNALE"];
  if (!validStatuses.includes(candidacy.candidacyStatuses?.[0]?.status)) {
    throw new Error(
      "Le statut de la candidature doit être DEMANDE_FINANCEMENT_ENVOYE ou DOSSIER_DE_VALIDATION_SIGNALE ",
    );
  }

  const dossierDeValidationFileId = uuidV4();
  const filePath = `${candidacyId}/${dossierDeValidationFileId}`;
  await uploadFileToS3({
    filePath,
    file: dossierDeValidationFile,
  });

  const dossierDeValidationOtherFilesWithIds: {
    file: UploadedFile;
    id: string;
  }[] = dossierDeValidationOtherFiles.map((f) => ({ id: uuidV4(), file: f }));

  for (const d of dossierDeValidationOtherFilesWithIds) {
    const filePath = `${candidacyId}/${d.id}`;
    await uploadFileToS3({
      filePath,
      file: d.file,
    });
  }

  await prismaClient.file.createMany({
    data: dossierDeValidationOtherFilesWithIds.map((d) => ({
      id: d.id,
      mimeType: d.file.mimetype,
      name: d.file.filename,
      path: `${candidacyId}/${d.id}`,
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
          path: `${candidacyId}/${dossierDeValidationFileId}`,
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
        connect: {
          id: candidacy.Feasibility[0].certificationAuthorityId || "",
        },
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

  const candidacyCertificationId = candidacy?.certificationId;
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
        candidacyId,
      });
    }
  }

  if (candidacy?.candidate?.email) {
    sendDVSentToCandidateEmail({ email: candidacy?.candidate?.email });
  }

  await logCandidacyAuditEvent({
    candidacyId,
    userKeycloakId,
    userEmail,
    userRoles,
    eventType: "DOSSIER_DE_VALIDATION_SENT",
  });

  return dossierDeValidation;
};
