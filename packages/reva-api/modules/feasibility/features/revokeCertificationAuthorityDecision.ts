import { updateCandidacyStatus } from "@/modules/candidacy/features/updateCandidacyStatus";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

const REVOKE_CONFIG = {
  ADMISSIBLE: {
    targetDecision: "COMPLETE" as const,
    targetCandidacyStatus: "DOSSIER_FAISABILITE_COMPLET" as const,
  },
  REJECTED: {
    targetDecision: "COMPLETE" as const,
    targetCandidacyStatus: "DOSSIER_FAISABILITE_COMPLET" as const,
  },
  COMPLETE: {
    targetDecision: "PENDING" as const,
    targetCandidacyStatus: "DOSSIER_FAISABILITE_ENVOYE" as const,
  },
  INCOMPLETE: {
    targetDecision: "PENDING" as const,
    targetCandidacyStatus: "DOSSIER_FAISABILITE_ENVOYE" as const,
  },
};

const ALLOWED_DECISIONS = Object.keys(REVOKE_CONFIG);

const ALLOWED_CANDIDACY_STATUSES = [
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_FAISABILITE_NON_RECEVABLE",
  "DOSSIER_FAISABILITE_COMPLET",
  "DOSSIER_FAISABILITE_INCOMPLET",
];

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

  if (!ALLOWED_DECISIONS.includes(feasibility.decision)) {
    throw new Error(
      "La décision ne peut être annulée que pour les dossiers recevables, non recevables, complets ou incomplets",
    );
  }

  if (!ALLOWED_CANDIDACY_STATUSES.includes(feasibility.candidacy.status)) {
    throw new Error(
      "La décision ne peut être annulée que lorsque la candidature est à l'étape DOSSIER_FAISABILITE_RECEVABLE, DOSSIER_FAISABILITE_NON_RECEVABLE, DOSSIER_FAISABILITE_COMPLET ou DOSSIER_FAISABILITE_INCOMPLET",
    );
  }

  const config =
    REVOKE_CONFIG[feasibility.decision as keyof typeof REVOKE_CONFIG];

  await prismaClient.$transaction(async (tx) => {
    await tx.feasibility.update({
      where: {
        id: feasibility.id,
      },
      data: {
        decision: config.targetDecision,
        decisionSentAt: null,
        decisionComment: null,
      },
    });

    // PDF don't use feasibilityDecision
    if (feasibility.feasibilityFormat === "DEMATERIALIZED") {
      await tx.feasibilityDecision.create({
        data: {
          feasibilityId: feasibility.id,
          decision: config.targetDecision,
          decisionSentAt: new Date().toISOString(),
        },
      });
    }

    await updateCandidacyStatus({
      candidacyId: feasibility.candidacyId,
      status: config.targetCandidacyStatus,
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
