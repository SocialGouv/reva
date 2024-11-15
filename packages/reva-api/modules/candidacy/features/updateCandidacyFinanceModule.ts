import { FinanceModule } from "@prisma/client";
import { prismaClient } from "../../../prisma/client";

export const updateCandidacyFinanceModule = ({
  candidacyId,
  financeModule,
}: {
  candidacyId: string;
  financeModule: FinanceModule;
}) =>
  prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: { financeModule },
  });
