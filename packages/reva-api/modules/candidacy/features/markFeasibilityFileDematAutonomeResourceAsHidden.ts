import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { CANDIDATURE_NON_TROUVEE } from "@/modules/shared/errors/messages";
import { prismaClient } from "@/prisma/client";

export const markFeasibilityFileDematAutonomeResourceAsHidden = async ({
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
    throw new Error(CANDIDATURE_NON_TROUVEE);
  }

  //Only update if the field is not already set
  if (candidacy.feasibilityFileDematAutonomeResourceHiddenAt) {
    return candidacy;
  }

  const feasibilityFileDematAutonomeResourceHiddenAt = new Date();

  await logCandidacyAuditEvent({
    candidacyId: candidacyId,
    eventType: "FEASIBILITY_FILE_DEMAT_AUTONOME_RESOURCE_HIDDEN_AT_UPDATED",
    userKeycloakId: context.auth.userInfo?.sub,
    userEmail: context.auth.userInfo?.email,
    userRoles: context.auth.userInfo?.realm_access?.roles || [],
    details: { feasibilityFileDematAutonomeResourceHiddenAt },
  });

  const result = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      feasibilityFileDematAutonomeResourceHiddenAt,
    },
  });

  return result;
};
