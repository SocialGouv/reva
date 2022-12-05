import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Candidate, FundingRequest } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface CreateFundingRequestDeps {
  createFundingRequest: (params: {
    candidacyId: string;
    fundingRequest: any;
  }) => Promise<Either<string, FundingRequest>>;
  getCandidateByCandidacyId: (id: string) => Promise<Either<string, Candidate>>;
  hasRole: (role: string) => boolean;
  existsCandidacyWithActiveStatuses: (params: {
    candidacyId: string;
    statuses: ["PARCOURS_CONFIRME", "ABANDON"];
  }) => Promise<Either<string, boolean>>;
}

const candidateBacNonFragile = (candidate: any) =>
  candidate.highestDegree.level >= 4 &&
  candidate.vulnerabilityIndicator.label !== "Vide";

const validateFundingRequest =
  (candidate: Candidate) => (fundingRequest: FundingRequest) => {
    const errors = [];
    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.diagnosisHourCount > 2
    ) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique ne peut être supérieur à 2."
      );
    } else if (fundingRequest.diagnosisHourCount > 4) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique ne peut être supérieur à 4."
      );
    }

    if (fundingRequest.diagnosisCost > 70) {
      errors.push(
        "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Diagnostique ne peut être supérieur à 70 euros."
      );
    }

    if (fundingRequest.postExamCost > 70) {
      errors.push(
        "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Post Jury ne peut être supérieur à 70 euros."
      );
    }

    if (fundingRequest.postExamCost > 70) {
      errors.push(
        "Le coût horaire demandé pour la prestation de l'Architecte de Parcours Post Jury ne peut être supérieur à 70 euros."
      );
    }

    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.individualHourCount > 15
    ) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique ne peut être supérieur à 15."
      );
    } else if (fundingRequest.individualHourCount > 30) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation de l'Architecte de Parcours Diagnostique ne peut être supérieur à 30."
      );
    }

    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.individualCost > 70
    ) {
      errors.push(
        "Le coût horaire demandé pour la prestation d'Accompagnement méthodologique à la VAE (individuel) ne peut être supérieur à 70 euros."
      );
    }

    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.collectiveHourCount > 15
    ) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) ne peut être supérieur à 15."
      );
    } else if (fundingRequest.collectiveHourCount > 30) {
      errors.push(
        "Le nombre d'heures demandées pour la prestation d'Accompagnement méthodologique à la VAE (collectif) ne peut être supérieur à 30."
      );
    }

    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.collectiveCost > 70
    ) {
      errors.push(
        "Le coût horaire demandé pour la prestation d'Accompagnement méthodologique à la VAE (individuel) ne peut être supérieur à 70 euros."
      );
    }

    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.basicSkillsCost > 20
    ) {
      errors.push(
        "Le coût horaire demandé pour la prestation Compléments formatifs Savoir de base ne peut être supérieur à 20 euros."
      );
    }

    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.certificateSkillsCost > 20
    ) {
      errors.push(
        "Le coût horaire demandé pour la prestation Compléments formatifs Bloc de Compétences ne peut être supérieur à 20 euros."
      );
    }

    if (
      fundingRequest.mandatoryTrainingsHourCount +
        fundingRequest.basicSkillsHourCount +
        fundingRequest.certificateSkillsHourCount >
      78
    ) {
      errors.push(
        "Le nombre d'heures total prescrit pour les actes formatifs ne peut être supérieur à 78."
      );
    }

    if (fundingRequest.examHourCount > 2) {
      errors.push(
        "Le nombre d'heures demandé pour la prestation Jury ne peut être supérieur à 2."
      );
    }

    if (
      candidateBacNonFragile(candidate) &&
      fundingRequest.certificateSkillsCost > 20
    ) {
      errors.push(
        "Le coût horaire demandé pour la prestation Jury ne peut être supérieur à 20 euros."
      );
    }

    if (errors.length) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
          `Une erreur est survenue lors de la validation du formulaire`,
          errors
        )
      );
    } else {
      return Right(fundingRequest);
    }
  };

export const createFundingRequest =
  (deps: CreateFundingRequestDeps) =>
  async (params: {
    candidacyId: string;
    fundingRequest: any;
  }): Promise<Either<FunctionalError, FundingRequest>> => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la demande de financement de cette candidature`
        )
      );
    }

    const existsCandidacyInRequiredStatuses = EitherAsync.fromPromise(() =>
      deps.existsCandidacyWithActiveStatuses({
        candidacyId: params.candidacyId,
        statuses: ["PARCOURS_CONFIRME", "ABANDON"],
      })
    )
      .chain((existsCandidacy) => {
        if (!existsCandidacy) {
          return EitherAsync.liftEither(
            Left(
              `Le statut de la candidature ne permet pas d'effectuer une demande de financement`
            )
          );
        }
        return EitherAsync.liftEither(Right(existsCandidacy));
      })
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, error)
      );

    const getCandidateByCandidacyId = EitherAsync.fromPromise(() =>
      deps.getCandidateByCandidacyId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    // check rules
    const checkRules = (candidate: any) =>
      EitherAsync.fromPromise(async () =>
        validateFundingRequest(candidate)(params.fundingRequest)
      );

    const createFundingRequest = EitherAsync.fromPromise(() =>
      deps.createFundingRequest(params)
    )
      .map((fundingRequest: FundingRequest) => {
        return {
          ...fundingRequest,
          basicSkills: fundingRequest?.basicSkills.map(
            (b: any) => b.basicSkill
          ),
          mandatoryTrainings: fundingRequest?.mandatoryTrainings.map(
            (t: any) => t.training
          ),
        };
      })
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
            `Erreur lors de la creation de la demande de financement`
          )
      );

    return existsCandidacyInRequiredStatuses
      .chain(() => getCandidateByCandidacyId)
      .chain(checkRules)
      .chain(() => createFundingRequest);
  };
