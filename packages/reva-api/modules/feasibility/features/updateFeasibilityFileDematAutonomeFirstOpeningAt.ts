import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

export const updateFeasibilityFileDematAutonomeFirstOpeningAt = async ({
  candidacyId,
  context,
}: {
  context: GraphqlContext;
  candidacyId: string;
}) => {
  const candidacy = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });

  if (!candidacy) {
    throw new Error("Candidacy not found");
  }

  //Only update if the field is not already set
  if (candidacy.feasibilityFileDematAutonomeFirstOpeningAt) {
    return candidacy;
  }

  const feasibilityFileDematAutonomeFirstOpeningAt = new Date();

  await logCandidacyAuditEvent({
    candidacyId: candidacyId,
    eventType: "FEASIBILITY_FILE_DEMAT_AUTONOME_FIRST_OPENING_AT_UPDATED",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
    details: { feasibilityFileDematAutonomeFirstOpeningAt },
  });

  return prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { feasibilityFileDematAutonomeFirstOpeningAt },
  });
};
