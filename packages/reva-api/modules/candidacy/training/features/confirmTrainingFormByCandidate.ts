import { prismaClient } from "../../../../prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { getCertificationByCandidacyId } from "../../certification/features/getCertificationByCandidacyId";
import { existsCandidacyWithActiveStatus } from "../../features/existsCandidacyWithActiveStatus";
import { updateCandidacyStatus } from "../../features/updateCandidacyStatus";

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

  const candidacyCertification = await getCertificationByCandidacyId({
    candidacyId,
  });

  const feasibilityFormat = candidacyCertification?.feasibilityFormat;

  await prismaClient.$transaction([
    prismaClient.candidacy.update({
      where: {
        id: candidacyId,
      },
      data: {
        feasibilityFormat,
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
        feasibilityFormat,
        candidacyId,
        isActive: true,
      },
    }),
  ]);

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "TRAINING_FORM_CONFIRMED",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return candidacy;
};
