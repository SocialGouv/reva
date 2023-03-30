import { Decimal } from "@prisma/client/runtime";

import { Candidacy, PaymentRequest } from "../../../../domain/types/candidacy";
import { FundingRequest } from "../../../../domain/types/candidate";
import { mapPaymentRequestBatchContent } from "./confirmPaymentRequest";

describe("payment request", () => {
  describe("tests on mapping code", () => {
    it("should not throw an error if everything is ok", async () => {
      const paymentRequest: PaymentRequest = {
        basicSkillsEffectiveHourCount: 1,
        basicSkillsEffectiveCost: new Decimal(3),
        certificateSkillsEffectiveHourCount: 2,
        certificateSkillsEffectiveCost: new Decimal(4),
        collectiveEffectiveHourCount: 3,
        collectiveEffectiveCost: new Decimal(5),
        diagnosisEffectiveHourCount: 4,
        diagnosisEffectiveCost: new Decimal(6),
        examEffectiveHourCount: 5,
        examEffectiveCost: new Decimal(7),
        individualEffectiveHourCount: 6,
        individualEffectiveCost: new Decimal(8),
        mandatoryTrainingsEffectiveHourCount: 7,
        mandatoryTrainingsEffectiveCost: new Decimal(9),
        postExamEffectiveHourCount: 8,
        postExamEffectiveCost: new Decimal(10),
        invoiceNumber: "invoiceNumber_123",
      } as PaymentRequest;
      const batch = mapPaymentRequestBatchContent({
        candidacy: { organism: { siret: "siret1234" } } as Candidacy,
        paymentRequest,
        fundingRequest: { numAction: "numAction_123" } as FundingRequest,
      });
      expect(batch).toMatchObject({
        NbHeureReaAPDiag: 4,
        CoutHeureReaAPDiag: 6,
        NbHeureReaAPPostJury: 8,
        CoutHeureReaAPPostJury: 10,
        NbHeureReaAccVAEColl: 3,
        CoutHeureReaAccVAEColl: 5,
        NbHeureReaAccVAEInd: 6,
        CoutHeureReaAccVAEInd: 8,
        NbHeureReaComplFormBlocDeCompetencesCertifiant: 2,
        CoutHeureReaComplFormBlocDeCompetencesCertifiant: 4,
        NbHeureReaComplFormObligatoire: 7,
        CoutHeureReaComplFormObligatoire: 9,
        NbHeureReaComplFormSavoirsDeBase: 1,
        CoutHeureReaComplFormSavoirsDeBase: 3,
        NbHeureReaJury: 5,
        CoutHeureReaJury: 7,
        NbHeureReaTotalActesFormatifs: 10,
        NumAction: "numAction_123",
        NumFacture: "invoiceNumber_123",
        SiretAP: "siret1234",
      });
    });
  });
});
