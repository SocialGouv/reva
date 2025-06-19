import { prismaClient } from "../../../prisma/client";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCandidacyStatus } from "../../candidacy/features/updateCandidacyStatus";

export const revokeCertificationAuthorityDecision = async ({
  feasibilityId,
  reason,
  context,
}: {
  feasibilityId: string;
  reason?: string;
  context: GraphqlContext;
}) => {
  const feasibility = await prismaClient.feasibility.findUnique({
    where: {
      id: feasibilityId,
    },
    select: {
      id: true,
      candidacyId: true,
      decision: true,
      feasibilityFormat: true,
    },
  });

  if (!feasibility) {
    throw new Error("Aucun dossier de faisabilité trouvé");
  }

  if (!["ADMISSIBLE", "REJECTED"].includes(feasibility.decision)) {
    throw new Error(
      "La décision ne peut être annulée que pour les dossiers recevables ou non recevables",
    );
  }

  await prismaClient.$transaction(async (tx) => {
    await tx.feasibility.update({
      where: {
        id: feasibility.id,
      },
      data: {
        decision: "COMPLETE",
        decisionSentAt: null,
        decisionComment: null,
      },
    });

    // PDF don't use feasibilityDecision
    if (feasibility.feasibilityFormat === "DEMATERIALIZED") {
      await tx.feasibilityDecision.create({
        data: {
          feasibilityId: feasibility.id,
          decision: "COMPLETE",
          decisionSentAt: new Date().toISOString(),
        },
      });
    }

    await updateCandidacyStatus({
      candidacyId: feasibility.candidacyId,
      status: "DOSSIER_FAISABILITE_COMPLET",
      tx,
    });

    await logCandidacyAuditEvent({
      candidacyId: feasibility.candidacyId,
      eventType: "FEASIBILITY_DECISION_REVOKED",
      userKeycloakId: context.auth.userInfo?.sub,
      userEmail: context.auth.userInfo?.email,
      userRoles: context.auth.userInfo?.realm_access?.roles || [],
      details: reason ? { reason } : undefined,
    });
  });

  return prismaClient.feasibility.findUnique({
    where: {
      id: feasibilityId,
    },
  });
};
