import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { AdmissibilityFvae } from "../candidacy.types";

export const updateAdmissibilityFvae = async ({
  params: {
    candidacyId,
    isAlreadyAdmissible,
    expiresAt,
    userKeycloakId,
    userEmail,
    userRoles,
  },
}: {
  params: AdmissibilityFvae & {
    candidacyId: string;
    userKeycloakId?: string;
    userEmail?: string;
    userRoles: KeyCloakUserRole[];
  };
}) => {
  const data = {
    isAlreadyAdmissible,
    expiresAt,
  };

  const result = await prismaClient.admissibilityFvae.upsert({
    where: { candidacyId },
    update: data,
    create: { candidacyId, ...data },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "ADMISSIBILITY_FVAE_UPDATED",
    userKeycloakId,
    userEmail,
    userRoles,
    details: data,
  });

  return result;
};
