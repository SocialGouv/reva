import {
  logCandidacyAuditEvent,
  CandidacyAuditLogUserInfo,
} from "../../candidacy-log/features/logCandidacyAuditEvent";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";
import { prismaClient } from "../../../prisma/client";
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

  if (!(await canCandidateUpdateCandidacy({ candidacyId }))) {
    throw new Error(
      "Impossible de mettre à jour la candidature une fois le premier entretien effetué",
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
