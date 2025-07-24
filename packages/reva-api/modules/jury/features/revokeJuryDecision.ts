import { getCandidacyById } from "@/modules/candidacy/features/getCandidacyById";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

export const revokeJuryDecision = async ({
  juryId,
  reason,
  roles,
  keycloakId,
  userEmail,
}: {
  juryId: string;
  reason?: string;
  roles: KeyCloakUserRole[];
  keycloakId?: string;
  userEmail?: string;
}) => {
  const jury = await prismaClient.jury.findUnique({
    where: { id: juryId },
  });

  if (!jury) {
    throw new Error("Ces informations de jury n'existent pas");
  }

  if (!jury.result) {
    throw new Error("Aucune décision n'a été prise pour ce jury");
  }

  const candidacy = await getCandidacyById({ candidacyId: jury.candidacyId });

  if (!candidacy) {
    throw new Error("La candidature n'existe pas");
  }

  const newJuryId = await prismaClient.$transaction(async (tx) => {
    await tx.jury.update({
      where: { id: juryId },
      data: {
        isActive: false,
      },
    });

    const newJury = await tx.jury.create({
      data: {
        candidacyId: jury.candidacyId,
        certificationAuthorityId: jury.certificationAuthorityId,
        convocationFileId: jury.convocationFileId,
        dateOfSession: jury.dateOfSession,
        timeOfSession: jury.timeOfSession,
        timeSpecified: jury.timeSpecified,
        addressOfSession: jury.addressOfSession,
        informationOfSession: jury.informationOfSession,
        result: null,
        dateOfResult: null,
        informationOfResult: null,
        isActive: true,
      },
    });

    await logCandidacyAuditEvent({
      candidacyId: jury.candidacyId,
      eventType: "JURY_DECISION_REVOKED",
      details: { reason },
      userKeycloakId: keycloakId,
      userEmail: userEmail,
      userRoles: roles,
      tx,
    });

    return newJury.id;
  });

  return prismaClient.jury.findUnique({
    where: { id: newJuryId },
  });
};
