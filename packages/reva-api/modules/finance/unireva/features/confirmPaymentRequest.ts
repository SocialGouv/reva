import { FundingRequest } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";
import { getCandidacy } from "../../../candidacy/features/getCandidacy";
import { updateCandidacyStatus } from "../../../candidacy/features/updateCandidacyStatus";
import { isFeatureActiveForUser } from "../../../feature-flipping/feature-flipping.features";
import { getOrganismById } from "../../../organism/features/getOrganism";
import { createPaymentRequestBatch } from "../database/paymentRequestBatches";
import { PaymentRequest, PaymentRequestBatchContent } from "../finance.types";

import { getFundingRequestByCandidacyId } from "./getFundingRequestByCandidacyId";
import { getPaymentRequestByCandidacyId } from "./getPaymentRequestByCandidacyId";

export const confirmPaymentRequest = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const candidacy = await getCandidacy({ candidacyId });
  const removeFundingAndPaymentRequestsFromCandidacyStatusesFeatureActive =
    await isFeatureActiveForUser({
      feature: "REMOVE_FUNDING_AND_PAYMENT_REQUESTS_FROM_CANDIDACY_STATUSES",
    });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  if (!removeFundingAndPaymentRequestsFromCandidacyStatusesFeatureActive) {
    if (candidacy.status !== "DEMANDE_FINANCEMENT_ENVOYE") {
      throw new Error(
        `La demande de paiement de la candidature ${candidacyId} ne peut être confirmée: statut invalide.`,
      );
    }
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

  await prismaClient.paymentRequest.update({
    where: { id: paymentRequest.id },
    data: { confirmedAt: new Date() },
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
