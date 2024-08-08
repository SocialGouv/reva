import { prismaClient } from "../../../../prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCandidacyStatus } from "../../../candidacy/database/candidacies";
import { existsCandidacyWithActiveStatus } from "../../../candidacy/features/existsCandidacyWithActiveStatus";

export const confirmTrainingFormByCandidate = async ({
  candidacyId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
} & CandidacyAuditLogUserInfo) => {
  if (
    !(await existsCandidacyWithActiveStatus({
      candidacyId,
      status: "PARCOURS_ENVOYE",
    }))
  ) {
    throw new Error(
      `Le parcours candidat de la candidature ${candidacyId} ne peut être confirmé`,
    );
  }

  const candidacy = await updateCandidacyStatus({
    candidacyId,
    status: "PARCOURS_CONFIRME",
  });

  const dematerializedFeasibilityFormatCertification =
    candidacy.certificationsAndRegions.find(
      (certificationAndRegion) =>
        certificationAndRegion.isActive &&
        certificationAndRegion.certification.feasibilityFormat ===
          "DEMATERIALIZED",
    );

  if (dematerializedFeasibilityFormatCertification) {
    await prismaClient.$transaction([
      prismaClient.candidacy.update({
        where: {
          id: candidacyId,
        },
        data: {
          feasibilityFormat: "DEMATERIALIZED",
        },
      }),
      prismaClient.feasibility.updateMany({
        where: {
          candidacyId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      }),
      prismaClient.feasibility.create({
        data: {
          feasibilityFormat: "DEMATERIALIZED",
          candidacyId,
          isActive: true,
        },
      }),
    ]);
  }

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "TRAINING_FORM_CONFIRMED",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return candidacy;
};
