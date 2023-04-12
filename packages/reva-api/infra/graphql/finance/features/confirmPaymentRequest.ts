import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import { Role } from "../../../../domain/types/account";
import {
  Candidacy,
  PaymentRequest,
  PaymentRequestBatch,
  PaymentRequestBatchContent,
} from "../../../../domain/types/candidacy";
import { FundingRequest } from "../../../../domain/types/candidate";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface ConfirmPaymentRequestDeps {
  hasRole: (role: Role) => boolean;
  existsCandidacyWithActiveStatus: (params: {
    candidacyId: string;
    status: "DEMANDE_FINANCEMENT_ENVOYE";
  }) => Promise<Either<string, boolean>>;
  getPaymentRequestByCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, Maybe<PaymentRequest>>>;
  createPaymentRequestBatch: (params: {
    paymentRequestId: string;
    content: PaymentRequestBatchContent;
  }) => Promise<Either<string, PaymentRequestBatch>>;
  getFundingRequestByCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, FundingRequest | null>>;
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "DEMANDE_PAIEMENT_ENVOYEE";
  }) => Promise<Either<string, Candidacy>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const confirmPaymentRequest =
  (deps: ConfirmPaymentRequestDeps) => (params: { candidacyId: string }) => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la recevabilité de cette candidature`
        )
      );
    }

    const validateCandidacyStatus = EitherAsync.fromPromise(() =>
      deps.existsCandidacyWithActiveStatus({
        candidacyId: params.candidacyId,
        status: "DEMANDE_FINANCEMENT_ENVOYE",
      })
    )
      .chain((existsCandidacy) => {
        if (!existsCandidacy) {
          return EitherAsync.liftEither(
            Left(
              `La demande de paiement de la candidature ${params.candidacyId} ne peut être confirmée: statut invalide.`
            )
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(
            FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
            error
          )
      );

    const getCandidacyPaymentRequest = async () =>
      (
        await deps.getPaymentRequestByCandidacyId({
          candidacyId: params.candidacyId,
        })
      )
        .chain((pr) =>
          pr.isJust()
            ? Right(pr.extract())
            : Left(
                `Aucune demande de paiement trouvée pour la candidature ${params.candidacyId}`
              )
        )
        .mapLeft(
          (error: string) =>
            new FunctionalError(
              FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
              error
            )
        );

    const updateCandidacy = EitherAsync.fromPromise(() =>
      deps.updateCandidacyStatus({
        candidacyId: params.candidacyId,
        status: "DEMANDE_PAIEMENT_ENVOYEE",
      })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
          `Erreur lors de la confirmation de la demande de paiement de la candidature ${params.candidacyId}`
        )
    );

    const createPaymentRequestBatch = async (paymentRequest: PaymentRequest) =>
      EitherAsync.fromPromise(() => deps.getCandidacyFromId(params.candidacyId))
        .map((candidacy) =>
          EitherAsync.fromPromise(() =>
            deps.getFundingRequestByCandidacyId({
              candidacyId: params.candidacyId,
            })
          ).map((fundingRequest) => ({
            fundingRequest,
            candidacy,
            paymentRequest,
          }))
        )
        .join()
        .map(mapPaymentRequestBatchContent)
        .chain((content) =>
          deps.createPaymentRequestBatch({
            paymentRequestId: paymentRequest.id,
            content,
          })
        )
        .mapLeft(
          (e) =>
            new FunctionalError(
              FunctionalCodeError.PAYMENT_REQUEST_NOT_CONFIRMED,
              e
            )
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
