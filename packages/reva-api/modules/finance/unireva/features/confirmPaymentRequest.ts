import { EitherAsync, Left, Right } from "purify-ts";

import { Candidacy } from "../../../candidacy/candidacy.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../shared/error/functionalError";
import {
  FundingRequest,
  PaymentRequest,
  PaymentRequestBatchContent,
} from "../finance.types";

import * as fundingRequestsDb from "../database/fundingRequests";
import * as paymentRequestsDb from "../database/paymentRequest";
import * as paymentRequestBatchesDb from "../database/paymentRequestBatches";

import {
  existsCandidacyWithActiveStatus,
  getCandidacyFromId,
  updateCandidacyStatus,
} from "../../../candidacy/database/candidacies";

export const confirmPaymentRequest = (params: { candidacyId: string }) => {
  const validateCandidacyStatus = EitherAsync.fromPromise(() =>
    existsCandidacyWithActiveStatus({
      candidacyId: params.candidacyId,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
    }),
  )
    .chain((existsCandidacy) => {
      if (!existsCandidacy) {
        return EitherAsync.liftEither(
          Left(
            `La demande de paiement de la candidature ${params.candidacyId} ne peut être confirmée: statut invalide.`,
          ),
        );
      }
      return EitherAsync.liftEither(Right(existsCandidacy));
    })
    .mapLeft(
      (error: string) =>
        new FunctionalError(
          FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
          error,
        ),
    );

  const getCandidacyPaymentRequest = async () =>
    (
      await paymentRequestsDb.getPaymentRequestByCandidacyId({
        candidacyId: params.candidacyId,
      })
    )
      .chain((pr) =>
        pr.isJust()
          ? Right(pr.extract())
          : Left(
              `Aucune demande de paiement trouvée pour la candidature ${params.candidacyId}`,
            ),
      )
      .mapLeft(
        (error: string) =>
          new FunctionalError(
            FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
            error,
          ),
      );

  const updateCandidacy = EitherAsync.fromPromise(() =>
    updateCandidacyStatus({
      candidacyId: params.candidacyId,
      status: "DEMANDE_PAIEMENT_ENVOYEE",
    }),
  ).mapLeft(
    () =>
      new FunctionalError(
        FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
        `Erreur lors de la confirmation de la demande de paiement de la candidature ${params.candidacyId}`,
      ),
  );

  const createPaymentRequestBatch = async (paymentRequest: PaymentRequest) =>
    EitherAsync.fromPromise(() => getCandidacyFromId(params.candidacyId))
      .map((candidacy) =>
        EitherAsync.fromPromise(() =>
          fundingRequestsDb.getFundingRequest({
            candidacyId: params.candidacyId,
          }),
        ).map((fundingRequest) => ({
          fundingRequest,
          candidacy,
          paymentRequest,
        })),
      )
      .join()
      .map(mapPaymentRequestBatchContent)
      .chain((content) =>
        paymentRequestBatchesDb.createPaymentRequestBatch({
          paymentRequestId: paymentRequest.id,
          content,
        }),
      )
      .mapLeft(
        (e) =>
          new FunctionalError(
            FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
            e,
          ),
      );

  return validateCandidacyStatus
    .chain(getCandidacyPaymentRequest)
    .chain(createPaymentRequestBatch)
    .chain(() => updateCandidacy);
};

export const mapPaymentRequestBatchContent = ({
  candidacy,
  fundingRequest,
  paymentRequest,
}: {
  candidacy: Candidacy;
  paymentRequest: PaymentRequest;
  fundingRequest: FundingRequest | null;
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
