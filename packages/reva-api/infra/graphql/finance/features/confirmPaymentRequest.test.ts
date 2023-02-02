import { Candidacy, PaymentRequest } from "../../../../domain/types/candidacy";
import { FundingRequest } from "../../../../domain/types/candidate";
import { mapPaymentRequestBatchContent } from "./confirmPaymentRequest";

describe("payment request", () => {
  describe("tests on mapping code", () => {
    it("should not throw an error if everything is ok", async () => {
      const paymentRequest: PaymentRequest = {
        basicSkillsEffectiveHourCount: 1,
        certificateSkillsEffectiveHourCount: 2,
        collectiveEffectiveHourCount: 3,
        diagnosisEffectiveHourCount: 4,
        examEffectiveHourCount: 5,
        individualEffectiveHourCount: 6,
        mandatoryTrainingsEffectiveHourCount: 7,
        postExamEffectiveHourCount: 8,
        invoiceNumber: "invoiceNumber_123",
      } as PaymentRequest;
      const batch = mapPaymentRequestBatchContent({
        candidacy: { organism: { siret: "siret1234" } } as Candidacy,
        paymentRequest,
        fundingRequest: { numAction: "numAction_123" } as FundingRequest,
      });
      expect(batch).toMatchObject({
        NbHeureReaAPDiag: 4,
        NbHeureReaAPPostJury: 8,
        NbHeureReaAccVAEColl: 3,
        NbHeureReaAccVAEInd: 6,
        NbHeureReaComplFormBlocDeCompetencesCertifiant: 2,
        NbHeureReaComplFormObligatoire: 7,
        NbHeureReaComplFormSavoirsDeBase: 1,
        NbHeureReaJury: 5,
        NbHeureReaTotalActesFormatifs: 10,
        NumAction: "numAction_123",
        NumFacture: "invoiceNumber_123",
        SiretAP: "siret1234",
      });
    });
  });
});
