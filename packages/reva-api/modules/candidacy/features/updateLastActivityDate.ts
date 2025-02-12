import { isBefore } from "date-fns";
import { logCandidacyAuditEvent } from "../../../modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "../../../prisma/client";
import { sendConfirmationActualisationEmailToAap } from "../emails/sendConfirmationActualisationEmailToAap";
import { sendConfirmationActualisationEmailToCandidate } from "../emails/sendConfirmationActualisationEmailToCandidate";

export const updateLastActivityDate = async ({
  input,
  context,
}: {
  input: {
    candidacyId: string;
    readyForJuryEstimatedAt: Date;
  };
  context: GraphqlContext;
}) => {
  const { candidacyId, readyForJuryEstimatedAt } = input;

  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      candidate: true,
      organism: true,
    },
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (isBefore(readyForJuryEstimatedAt, new Date())) {
    throw new Error(
      "La date de préparation pour le jury ne peut être dans le passé",
    );
  }

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "CANDIDACY_ACTUALISATION",
    userKeycloakId: context.auth.userInfo?.sub,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
    userEmail: context.auth.userInfo?.email,
  });

  const candidacyUpdated = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { readyForJuryEstimatedAt, lastActivityDate: new Date() },
  });
  const aap = candidacy?.organism;

  if (candidacy?.candidate) {
    await sendConfirmationActualisationEmailToCandidate({
      candidateEmail: candidacy.candidate.email,
      candidateFullName: `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`,
    });

    if (aap && candidacy.typeAccompagnement === "ACCOMPAGNE") {
      await sendConfirmationActualisationEmailToAap({
        aapEmail: aap.emailContact || aap.contactAdministrativeEmail || "",
        aapLabel: aap.label,
        candidateFullName: `${candidacy.candidate.firstname} ${candidacy.candidate.lastname}`,
      });
    }
  }

  return candidacyUpdated;
};
