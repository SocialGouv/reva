import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { UpdateCandidacyContestationCaduciteInput } from "../candidacy-contestation-caducite.types";
import { sendCandidacyContestationCaduciteConfirmedEmailToAap } from "../emails/sendCandidacyContestationCaduciteConfirmedEmailToAap";
import { sendCandidacyContestationCaduciteConfirmedEmailToCandidate } from "../emails/sendCandidacyContestationCaduciteConfirmedEmailToCandidate";
import { sendCandidacyContestationCaduciteInvalidatedEmailToAap } from "../emails/sendCandidacyContestationCaduciteInvalidatedEmailToAap";

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
      include: {
        candidacy: {
          include: {
            candidate: true,
            organism: true,
          },
        },
      },
    });

  if (!candidacyContestationCaducite) {
    throw new Error(
      "La contestation de la caducité de la candidature n'existe pas",
    );
  }

  if (!candidacyContestationCaducite.candidacy) {
    throw new Error("La candidature n'existe pas");
  }

  const decisionIsInvalidated =
    certificationAuthorityContestationDecision === "CADUCITE_INVALIDATED";
  const decisionIsConfirmed =
    certificationAuthorityContestationDecision === "CADUCITE_CONFIRMED";

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

  const candidateFullName = `${candidacyContestationCaducite.candidacy.candidate?.firstname} ${candidacyContestationCaducite.candidacy.candidate?.lastname}`;
  const candidateEmail = candidacyContestationCaducite.candidacy.candidate
    ?.email as string;
  const aapEmail =
    candidacyContestationCaducite.candidacy.organism?.emailContact ||
    candidacyContestationCaducite.candidacy.organism
      ?.contactAdministrativeEmail;

  const aapLabel =
    candidacyContestationCaducite.candidacy.organism?.nomPublic ||
    candidacyContestationCaducite.candidacy.organism?.label;

  if (decisionIsConfirmed) {
    await sendCandidacyContestationCaduciteConfirmedEmailToCandidate({
      candidateFullName,
      candidateEmail,
    });
    await sendCandidacyContestationCaduciteConfirmedEmailToAap({
      aapLabel: aapLabel || "",
      aapEmail: aapEmail || "",
      candidateFullName,
    });
  }

  if (decisionIsInvalidated) {
    await sendCandidacyContestationCaduciteInvalidatedEmailToAap({
      candidateFullName,
      aapLabel: aapLabel || "",
      aapEmail: aapEmail || "",
    });
  }

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
