import { FinanceModule } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../candidacy-log/features/logCandidacyAuditEvent";
import { getCandidacy } from "./getCandidacy";
import { updateCandidacyStatus } from "./updateCandidacyStatus";

export const updateCandidacyFinanceModule = async ({
  candidacyId,
  financeModule,
  reason,
  userInfo,
}: {
  candidacyId: string;
  financeModule: FinanceModule;
  reason?: string;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  //if we are updating the finance module to hors_plateforme and the current status is either DEMANDE_PAIEMENT_ENVOYEE or DEMANDE_FINANCEMENT_ENVOYE
  // we need to rollback the candidacy to the previous status since those two statuses don't make sense with an hors_plateforme candidacy
  if (financeModule === "hors_plateforme") {
    const candidacy = await getCandidacy({ candidacyId });
    if (!candidacy) {
      throw new Error(`Candidature non trouvée`);
    }
    if (
      candidacy.status === "DEMANDE_PAIEMENT_ENVOYEE" ||
      candidacy.status === "DEMANDE_FINANCEMENT_ENVOYE"
    ) {
      await rollbackToPreviousStatus({ candidacyId });
    }
  }

  const result = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { financeModule },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "FINANCE_MODULE_UPDATED",
    details: { financeModule, reason },
    ...userInfo,
  });

  return result;
};

const rollbackToPreviousStatus = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacyWithSortedStatus = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: { candidacyStatuses: { orderBy: { createdAt: "asc" } } },
  });

  if (!candidacyWithSortedStatus) {
    throw new Error(`Candidature non trouvée`);
  }

  const currentStatus = candidacyWithSortedStatus.status;
  const currentStatusIndex =
    candidacyWithSortedStatus.candidacyStatuses.findIndex(
      (status) => status.status === currentStatus && status.isActive,
    );

  if (currentStatusIndex < 1) {
    throw new Error(
      `Impossible de revenir en arrière dans les statuts de la candidature`,
    );
  }
  const previousStatus =
    candidacyWithSortedStatus.candidacyStatuses[currentStatusIndex - 1];

  await updateCandidacyStatus({
    candidacyId,
    status: previousStatus.status,
  });
};
