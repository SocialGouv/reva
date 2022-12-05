import { Either, EitherAsync, Left, Right } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FundingRequest } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface CreateFundingRequestDeps {
  createFundingRequest: (params: {
    candidacyId: string;
    fundingRequest: any;
  }) => Promise<Either<string, FundingRequest>>;
  hasRole: (role: string) => boolean;
  existsCandidacyWithActiveStatuses: (params: {
    candidacyId: string;
    statuses: ["PARCOURS_CONFIRME", "ABANDON"];
  }) => Promise<Either<string, boolean>>;
}

export const createFundingRequest =
  (deps: CreateFundingRequestDeps) =>
  async (params: {
    candidacyId: string;
    fundingRequest: any;
  }): Promise<Either<FunctionalError, FundingRequest>> => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage-candidacy")) {
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
            FunctionalCodeError.CANDIDACY_NOT_CREATED,
            `Erreur lors de la creation de la demand de financement`
          )
      );

    return existsCandidacyInRequiredStatuses.chain(() => createFundingRequest);
  };
