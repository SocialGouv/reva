import {
  logCandidacyAuditEvent,
  CandidacyAuditLogUserInfo,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";
import { getCandidacy } from "./getCandidacy";

export const updateGoalsOfCandidacy = async ({
  candidacyId,
  goals,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  goals: {
    goalId: string;
  }[];
} & CandidacyAuditLogUserInfo) => {
  const candidacy = await getCandidacy({ candidacyId });
  if (!candidacy) {
    throw new Error(`Candidature ${candidacyId} non trouvée`);
  }

  if (!(await canCandidateUpdateCandidacy({ candidacy }))) {
    throw new Error(
      "Impossible de mettre à jour les objectifs après avoir confirmé le parcours",
    );
  }

  const [, updatedGoals] = await prismaClient.$transaction([
    prismaClient.candicadiesOnGoals.deleteMany({
      where: {
        candidacyId: candidacyId,
      },
    }),
    prismaClient.candicadiesOnGoals.createMany({
      data: goals.map((goal) => ({
        candidacyId,
        goalId: goal.goalId,
      })),
    }),
  ]);

  const result = updatedGoals.count;

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "GOALS_UPDATED",
    userKeycloakId,
    userEmail,
    userRoles,
  });

  return result;
};
