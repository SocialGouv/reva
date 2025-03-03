import { FinanceModule } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";
import {
  CandidacyAuditLogUserInfo,
  logCandidacyAuditEvent,
} from "../../candidacy-log/features/logCandidacyAuditEvent";

export const updateCandidacyFinanceModule = async ({
  candidacyId,
  financeModule,
  userInfo,
}: {
  candidacyId: string;
  financeModule: FinanceModule;
  userInfo: CandidacyAuditLogUserInfo;
}) => {
  const result = await prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { financeModule },
  });

  await logCandidacyAuditEvent({
    candidacyId,
    eventType: "FINANCE_MODULE_UPDATED",
    details: { financeModule },
    ...userInfo,
  });

  return result;
};
