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
import { allowFileTypeByDocumentType } from "../../../modules/shared/file/allowFileTypes";

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
      candidate: { select: { email: true, departmentId: true } },
      Feasibility: { where: { isActive: true } },
    },
  });
  if (!candidacy) {
    throw new Error("La candidature n'a pas été trouvée");
  }
  if (candidacy.candidacyDropOut) {
    throw new Error("La candidature a été abandonnée");
  }
  if (candidacy.status === "ARCHIVE") {
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
          "DOSSIER_DE_VALIDATION_ENVOYE",
        ]
      : [
          "DEMANDE_FINANCEMENT_ENVOYE",
          "DEMANDE_PAIEMENT_ENVOYEE",
          "DOSSIER_DE_VALIDATION_SIGNALE",
          "DOSSIER_DE_VALIDATION_ENVOYE",
        ];
  if (!validStatuses.includes(candidacy.status)) {
    throw new Error(
      `Le statut de la candidature doit être ${validStatuses.join(" ou ")}`,
    );
  }

  const jury = await prismaClient.jury.findFirst({
    where: { candidacyId: candidacy.id, isActive: true },
  });

  const failedJuryResults = [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "FAILURE",
    "CANDIDATE_EXCUSED",
    "CANDIDATE_ABSENT",
  ];

  const hasFailedJuryResult =
    jury?.result && failedJuryResults.includes(jury.result);

  const hasAlreadySentDossierValidation = [
    "DOSSIER_DE_VALIDATION_ENVOYE",
    "DEMANDE_PAIEMENT_ENVOYEE",
  ].includes(candidacy.status);

  if (hasAlreadySentDossierValidation && !hasFailedJuryResult) {
    throw new Error(
      "Seul un candidat ayant échoué totalement ou partiellement au jury peut renvoyer un dossier de validation",
    );
  }

  const getFilePath = ({ fileId }: { fileId: string }) =>
    `candidacies/${candidacyId}/dossier_de_validation/${fileId}`;

  const dossierDeValidationFileId = uuidV4();
  const dossierDeValidationFilePath = getFilePath({
    fileId: dossierDeValidationFileId,
  });
  await uploadFileToS3({
    filePath: dossierDeValidationFilePath,
    mimeType: dossierDeValidationFile.mimetype,
    data: dossierDeValidationFile._buf,
    allowedFileTypes: allowFileTypeByDocumentType.dossierDeValidationFile,
  });

  const dossierDeValidationOtherFilesWithIds: {
    file: UploadedFile;
    id: string;
  }[] = dossierDeValidationOtherFiles.map((f) => ({ id: uuidV4(), file: f }));

  for (const d of dossierDeValidationOtherFilesWithIds) {
    const filePath = getFilePath({ fileId: d.id });
    await uploadFileToS3({
      filePath,
      mimeType: d.file.mimetype,
      data: d.file._buf,
      allowedFileTypes:
        allowFileTypeByDocumentType.dossierDeValidationOtherFiles,
    });
  }

  await prismaClient.file.createMany({
    data: dossierDeValidationOtherFilesWithIds.map((d) => ({
      id: d.id,
      mimeType: d.file.mimetype,
      name: d.file.filename,
      path: getFilePath({ fileId: d.id }),
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
          path: `${dossierDeValidationFilePath}`,
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

  if (!hasAlreadySentDossierValidation) {
    await updateCandidacyStatus({
      candidacyId,
      status: "DOSSIER_DE_VALIDATION_ENVOYE",
    });
  }

  // The candidate send a new DV and will be able to pass the jury again
  if (hasFailedJuryResult) {
    await prismaClient.jury.updateMany({
      where: { candidacyId },
      data: { isActive: false },
    });
  }

  const candidacyCertificationId = candidacy?.certificationId;
  const candidateDepartmentId = candidacy?.candidate?.departmentId;

  if (candidacyCertificationId && candidateDepartmentId) {
    const certificationAuthorityLocalAccounts =
      await getCertificationAuthorityLocalAccountByCertificationAuthorityIdCertificationAndDepartment(
        {
          certificationAuthorityId:
            dossierDeValidation.certificationAuthorityId,
          certificationId: candidacyCertificationId,
          departmentId: candidateDepartmentId,
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
