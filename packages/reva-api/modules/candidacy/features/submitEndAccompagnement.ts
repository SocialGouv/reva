import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getCandidateLoginUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { prismaClient } from "@/prisma/client";

import { sendEndAccompagnementSubmittedToCandidate } from "../emails/sendEndAccompagnementSubmittedToCandidate";

import { getCandidacyById } from "./getCandidacyById";

const JURY_FULL_SUCCESS_RESULT = [
  "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
];

export const submitEndAccompagnement = async ({
  candidacyId,
  endAccompagnementDate,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  endAccompagnementDate: Date;
  userKeycloakId: string;
  userEmail: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await getCandidacyById({
    candidacyId,
    includes: { Jury: true, candidate: true },
  });
  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const juryHasFullSuccess = candidacy.Jury.find(
    (jury) =>
      jury.isActive && JURY_FULL_SUCCESS_RESULT.includes(jury.result || ""),
  );

  const updatedCandidacy = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      endAccompagnementDate,
      endAccompagnementStatus: juryHasFullSuccess
        ? "CONFIRMED_BY_ADMIN"
        : "PENDING",
    },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    tx: prismaClient,
    eventType: "END_ACCOMPAGNEMENT_SUBMITTED",
    details: {
      endAccompagnementDate,
    },
    userKeycloakId,
    userEmail,
    userRoles,
  });

  const candidate = candidacy.candidate;

  if (candidate) {
    const candidateFullName = `${candidate.firstname} ${candidate.lastname}`;
    const candidateLoginUrl = getCandidateLoginUrl({
      candidateEmail: candidate.email,
    });
    await sendEndAccompagnementSubmittedToCandidate({
      email: candidate.email,
      candidateFullName,
      candidateLoginUrl,
    });
  }

  return updatedCandidacy;
};
