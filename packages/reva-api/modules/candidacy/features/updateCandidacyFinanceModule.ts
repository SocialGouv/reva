import { FinanceModule } from "@prisma/client";

import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { prismaClient } from "@/prisma/client";

import { getCandidacy } from "./getCandidacy";

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
