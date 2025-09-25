import { FeasibilityStatus } from "@prisma/client";
import { v4 } from "uuid";

import { updateCandidacyStatus } from "@/modules/candidacy/features/updateCandidacyStatus";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { allowFileTypeByDocumentType } from "@/modules/shared/file/allowFileTypes";
import { UploadedFile } from "@/modules/shared/file/file.interface";
import { S3File, uploadFileToS3 } from "@/modules/shared/file/file.service";
import { prismaClient } from "@/prisma/client";

import { sendFeasibilityDecisionTakenToAAPEmail } from "../emails/sendFeasibilityDecisionTakenToAAPEmail";
import { sendFeasibilityValidatedToCandidateAccompagneEmail } from "../emails/sendFeasibilityValidatedToCandidateAccompagneEmail";
import { sendFeasibilityValidatedToCandidateAutonomeEmail } from "../emails/sendFeasibilityValidatedToCandidateAutonomeEmail";
import { deleteFeasibilityIDFile } from "../features/deleteFeasibilityIDFile";

import { canManageFeasibility } from "./canManageFeasibility";

export const validateFeasibility = async ({
  feasibilityId,
  comment,
  hasRole,
  keycloakId,
  userEmail,
  userRoles,
  infoFile,
}: {
  feasibilityId: string;
  comment?: string;
  hasRole: (role: string) => boolean;
  keycloakId: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
  infoFile?: UploadedFile;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: { id: feasibilityId },
  });

  if (!feasibility) {
    throw new Error("Dossier de faisabilité introuvable");
  }

  const authorized = await canManageFeasibility({
    hasRole,
    feasibility,
    keycloakId,
  });

  if (hasRole("admin") || authorized) {
    if (
      feasibility.decision == FeasibilityStatus.ADMISSIBLE ||
      feasibility.decision == FeasibilityStatus.REJECTED
    ) {
      throw new Error("Le faisabilité a déjà été prononcée sur ce dossier");
    }

    let infoFileInstance: S3File | undefined;
    if (infoFile) {
      infoFileInstance = {
        filePath: `candidacies/${feasibility.candidacyId}/feasibility/${v4()}`,
        data: infoFile._buf,
        mimeType: infoFile.mimetype,
        allowedFileTypes: allowFileTypeByDocumentType.feasibilityDecisionFile,
      };

      await uploadFileToS3(infoFileInstance);
    }

    const updatedFeasibility = await prismaClient.feasibility.update({
      where: { id: feasibilityId },
      data: {
        decision: "ADMISSIBLE",
        decisionComment: comment,
        decisionSentAt: new Date(),
        decisionFile:
          infoFile && infoFileInstance
            ? {
                create: {
                  mimeType: infoFile.mimetype,
                  name: infoFile.filename,
                  path: infoFileInstance?.filePath,
                },
              }
            : undefined,
      },
      include: {
        candidacy: {
          include: {
            certification: {
              select: { label: true },
            },
            candidate: {
              select: {
                email: true,
              },
            },
            organism: { select: { contactAdministrativeEmail: true } },
          },
        },
        certificationAuthority: true,
      },
    });

    await updateCandidacyStatus({
      candidacyId: feasibility?.candidacyId || "",
      status: "DOSSIER_FAISABILITE_RECEVABLE",
    });

    const isAutonome =
      updatedFeasibility.candidacy.typeAccompagnement === "AUTONOME";
    const certificationName =
      updatedFeasibility.candidacy.certification?.label ||
      "certification inconnue";
    const certificationAuthorityLabel =
      updatedFeasibility.certificationAuthority?.label ||
      "certificateur inconnu";
    if (isAutonome) {
      sendFeasibilityValidatedToCandidateAutonomeEmail({
        email: updatedFeasibility.candidacy.candidate?.email as string,
        certificationName,
        comment,
        certificationAuthorityLabel,
        infoFile,
      });
    } else {
      sendFeasibilityValidatedToCandidateAccompagneEmail({
        email: updatedFeasibility.candidacy.candidate?.email as string,
        certificationName,
        comment,
        certificationAuthorityLabel,
        infoFile,
      });

      if (updatedFeasibility.candidacy.organism?.contactAdministrativeEmail) {
        sendFeasibilityDecisionTakenToAAPEmail({
          email:
            updatedFeasibility.candidacy.organism?.contactAdministrativeEmail,
          feasibilityUrl: getBackofficeUrl({
            path: `/candidacies/${updatedFeasibility.candidacyId}/feasibility-aap/pdf`,
          }),
        });
      }
    }

    // Delete ID File from feasibility
    await deleteFeasibilityIDFile(feasibilityId);

    await logCandidacyAuditEvent({
      candidacyId: feasibility.candidacyId,
      userKeycloakId: keycloakId,
      userEmail,
      userRoles,
      eventType: "FEASIBILITY_VALIDATED",
    });
    return updatedFeasibility;
  } else {
    throw new Error("Utilisateur non autorisé");
  }
};
