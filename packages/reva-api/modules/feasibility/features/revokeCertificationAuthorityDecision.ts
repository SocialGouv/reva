import { updateCandidacyStatus } from "@/modules/candidacy/features/updateCandidacyStatus";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

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
      candidacy: {
        select: {
          status: true,
        },
      },
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

  if (
    ![
      "DOSSIER_FAISABILITE_RECEVABLE",
      "DOSSIER_FAISABILITE_NON_RECEVABLE",
    ].includes(feasibility.candidacy.status)
  ) {
    throw new Error(
      "La décision ne peut être annulée que lorsque la candidature est à l'étape DOSSIER_FAISABILITE_RECEVABLE ou DOSSIER_FAISABILITE_NON_RECEVABLE",
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
