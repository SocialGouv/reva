import { CandidacyStatusStep, FinanceModule } from "@prisma/client";
import { candidateJPL, expertFiliereOrganism } from "./people-organisms";
import { randomUUID } from "crypto";
import { sub } from "date-fns";

export const candidacyUnifvae = {
  id: randomUUID(),
  organismId: expertFiliereOrganism.id,
  financeModule: FinanceModule.unifvae,
  candidateId: candidateJPL.id,
};

export const candidacyUnireva = {
  ...candidacyUnifvae,
  id: randomUUID(),
  financeModule: FinanceModule.unireva,
};

const sixMonthsAgo = sub(new Date(), { months: 6 });
const sixMonthsAgoMinusOneMinute = sub(new Date(), { months: 6, minutes: -1 });

export const dropOutSixMonthsAgo = {
  createdAt: sixMonthsAgo,
  droppedOutAt: sixMonthsAgo,
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
};

export const dropOutSixMonthsAgoMinusOneMinute = {
  createdAt: sixMonthsAgoMinusOneMinute,
  droppedOutAt: sixMonthsAgoMinusOneMinute,
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
};
