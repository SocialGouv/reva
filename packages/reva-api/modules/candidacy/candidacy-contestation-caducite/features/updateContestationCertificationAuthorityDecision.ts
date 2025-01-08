import { prismaClient } from "../../../../prisma/client";
import { logCandidacyAuditEvent } from "../../../candidacy-log/features/logCandidacyAuditEvent";
import { UpdateCandidacyContestationCaduciteInput } from "../candidacy-contestation-caducite.types";

export const updateContestationCertificationAuthorityDecision = async ({
  input,
  context,
}: {
  input: UpdateCandidacyContestationCaduciteInput;
  context: GraphqlContext;
}) => {
  const { candidacyId, certificationAuthorityContestationDecision } = input;

  const candidacyContestationCaducite =
    await prismaClient.candidacyContestationCaducite.findFirst({
      where: {
        candidacyId,
        certificationAuthorityContestationDecision: "DECISION_PENDING",
      },
    });

  if (!candidacyContestationCaducite) {
    throw new Error(
      "La contestation de la caducité de la candidature n'existe pas",
    );
  }

  const decisionIsInvalidated =
    certificationAuthorityContestationDecision === "CADUCITE_INVALIDATED";

  const updatedCandidacyContestationCaducite =
    await prismaClient.candidacyContestationCaducite.update({
      where: { id: candidacyContestationCaducite.id },
      data: {
        certificationAuthorityContestationDecision,
        ...(decisionIsInvalidated && {
          candidacy: { update: { lastActivityDate: new Date() } },
        }),
      },
    });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: decisionIsInvalidated
      ? "CANDIDACY_CONTESTATION_CADADUCITE_DECISION_INVALIDATED"
      : "CANDIDACY_CONTESTATION_CADADUCITE_DECISION_CONFIRMED",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
  });

  return updatedCandidacyContestationCaducite;
};
