import { CandidacyStatusStep, FinanceModule } from "@prisma/client";
import { candidateJPL, expertFiliereOrganism } from "./people-organisms";
import { randomUUID } from "crypto";
import { sub } from "date-fns";

export const certificationId1FromSeed = "51eef7ae-80c0-481b-946f-9d6e1b9fc70c";

export const certificationId2FromSeed = "2f1c2d5f-8b24-471b-8824-b7f5cb4f7bb8";

export const candidacyUnifvae = {
  id: randomUUID(),
  organismId: expertFiliereOrganism.id,
  financeModule: FinanceModule.unifvae,
  candidateId: candidateJPL.id,
  isCertificationPartial: false,
  certificationId: certificationId1FromSeed,
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
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
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
};

export const dropOutSixMonthsAgoMinusOneMinute = {
  createdAt: sixMonthsAgoMinusOneMinute,
  status: CandidacyStatusStep.PARCOURS_CONFIRME,
};
