import { Candidacy } from "../../../candidacy/candidacy.types";
import { PaymentRequest, PaymentRequestBatchContent } from "../finance.types";

import {
  existsCandidacyWithActiveStatus,
  getCandidacyFromId,
  updateCandidacyStatus,
} from "../../../candidacy/database/candidacies";
import { getPaymentRequestByCandidacyId } from "./getPaymentRequestByCandidacyId";
import { getFundingRequestByCandidacyId } from "./getFundingRequestByCandidacyId";
import { FundingRequest } from "@prisma/client";
import { createPaymentRequestBatch } from "../database/paymentRequestBatches";

export const confirmPaymentRequest = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  if (
    !(await existsCandidacyWithActiveStatus({
      candidacyId,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
    }))
  ) {
    throw new Error(
      `La demande de paiement de la candidature ${candidacyId} ne peut être confirmée: statut invalide.`,
    );
  }

  const candidacy = (await getCandidacyFromId(candidacyId)).unsafeCoerce();
  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const fundingRequest = await getFundingRequestByCandidacyId({ candidacyId });
  if (!fundingRequest) {
    throw new Error("Demande de financement non trouvée");
  }

  const paymentRequest = await getPaymentRequestByCandidacyId({ candidacyId });
  if (!paymentRequest) {
    throw new Error("Demande de paiement non trouvée");
  }

  await createPaymentRequestBatch({
    paymentRequestId: paymentRequest.id,
    content: mapPaymentRequestBatchContent({
      candidacy,
      fundingRequest,
      paymentRequest,
    }),
  });

  await updateCandidacyStatus({
    candidacyId: candidacyId,
    status: "DEMANDE_PAIEMENT_ENVOYEE",
  });

  return candidacy;
};

export const mapPaymentRequestBatchContent = ({
  candidacy,
  fundingRequest,
  paymentRequest,
}: {
  candidacy: Candidacy;
  paymentRequest: PaymentRequest;
  fundingRequest: FundingRequest;
}): PaymentRequestBatchContent => ({
  NumAction: fundingRequest?.numAction || "",
  NumFacture: paymentRequest.invoiceNumber,
  SiretAP: candidacy.organism?.siret || "",
  NbHeureReaJury: paymentRequest.examEffectiveHourCount,
  CoutHeureReaJury: paymentRequest.examEffectiveCost.toNumber(),
  NbHeureReaAPDiag: paymentRequest.diagnosisEffectiveHourCount,
  CoutHeureReaAPDiag: paymentRequest.diagnosisEffectiveCost.toNumber(),
  NbHeureReaAccVAEInd: paymentRequest.individualEffectiveHourCount,
  CoutHeureReaAccVAEInd: paymentRequest.individualEffectiveCost.toNumber(),
  NbHeureReaAPPostJury: paymentRequest.postExamEffectiveHourCount,
  CoutHeureReaAPPostJury: paymentRequest.postExamEffectiveCost.toNumber(),
  NbHeureReaAccVAEColl: paymentRequest.collectiveEffectiveHourCount,
  CoutHeureReaAccVAEColl: paymentRequest.collectiveEffectiveCost.toNumber(),
  NbHeureReaTotalActesFormatifs:
    paymentRequest.mandatoryTrainingsEffectiveHourCount +
    paymentRequest.basicSkillsEffectiveHourCount +
    paymentRequest.certificateSkillsEffectiveHourCount,
  NbHeureReaComplFormObligatoire:
    paymentRequest.mandatoryTrainingsEffectiveHourCount,
  CoutHeureReaComplFormObligatoire:
    paymentRequest.mandatoryTrainingsEffectiveCost.toNumber(),
  NbHeureReaComplFormSavoirsDeBase:
    paymentRequest.basicSkillsEffectiveHourCount,
  CoutHeureReaComplFormSavoirsDeBase:
    paymentRequest.basicSkillsEffectiveCost.toNumber(),
  NbHeureReaComplFormBlocDeCompetencesCertifiant:
    paymentRequest.certificateSkillsEffectiveHourCount,
  CoutHeureReaComplFormBlocDeCompetencesCertifiant:
    paymentRequest.certificateSkillsEffectiveCost.toNumber(),
  NBHeureReaActeFormatifComplémentaire_Autre:
    paymentRequest.otherTrainingEffectiveHourCount,
  CoutHeureReaActeFormatifComplémentaire_Autre:
    paymentRequest.otherTrainingEffectiveCost.toNumber(),
});
