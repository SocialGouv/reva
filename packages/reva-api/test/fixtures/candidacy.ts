import { FinanceModule } from "@prisma/client";
import { candidateJPL, expertFiliereOrganism } from "./people-organisms";
import { randomUUID } from "crypto";

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
