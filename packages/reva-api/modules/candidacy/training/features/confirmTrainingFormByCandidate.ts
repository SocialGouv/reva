import { FeasibilityFormat } from "@prisma/client";

import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

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

  const candidacyCertification = await getCertificationByCandidacyId({
    candidacyId,
  });

  const feasibilityFormat =
    candidacyCertification?.feasibilityFormat as FeasibilityFormat;

  const [_, __, feasibility] = await prismaClient.$transaction([
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

  if (feasibilityFormat === "DEMATERIALIZED") {
    await prismaClient.feasibility.update({
      where: {
        id: feasibility.id,
      },
      data: {
        dematerializedFeasibilityFile: {
          create: {},
        },
      },
    });
  }

  const candidacy = await updateCandidacyStatus({
    candidacyId,
    status: "PARCOURS_CONFIRME",
  });
  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "TRAINING_FORM_CONFIRMED",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return candidacy;
};
