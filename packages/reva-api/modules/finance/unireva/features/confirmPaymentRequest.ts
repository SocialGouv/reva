import { PaymentRequest, PaymentRequestBatchContent } from "../finance.types";
import { FundingRequest } from "@prisma/client";
import { updateCandidacyStatus } from "../../../candidacy/database/candidacies";
import { existsCandidacyWithActiveStatus } from "../../../candidacy/features/existsCandidacyWithActiveStatus";
import { getCandidacy } from "../../../candidacy/features/getCandidacy";
import { createPaymentRequestBatch } from "../database/paymentRequestBatches";
import { getFundingRequestByCandidacyId } from "./getFundingRequestByCandidacyId";
import { getPaymentRequestByCandidacyId } from "./getPaymentRequestByCandidacyId";
import { getOrganismById } from "../../../organism/features/getOrganism";

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

  const candidacy = await getCandidacy({ candidacyId });
  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (!candidacy.organismId) {
    throw new Error("Pas d'organisme pour la candidature");
  }

  const organism = await getOrganismById({ organismId: candidacy.organismId });

  if (!organism) {
    throw new Error("Organisme non trouvé");
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
      organismSiret: organism.siret,
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
  organismSiret,
  fundingRequest,
  paymentRequest,
}: {
  organismSiret: string;
  paymentRequest: PaymentRequest;
  fundingRequest: FundingRequest;
}): PaymentRequestBatchContent => ({
  NumAction: fundingRequest?.numAction || "",
  NumFacture: paymentRequest.invoiceNumber,
  SiretAP: organismSiret || "",
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
