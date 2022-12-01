import { Either, EitherAsync } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface TrainingForm {
  individualHourCount: number;
  collectiveHourCount: number;
  basicSkills: any;
  trainings: any;
  otherTraining: string;
}

interface FundingRequest {
  id: string;
  candidacyId: string;
  individualHourCount: number;
  collectiveHourCount: number;
  basicSkills: any;
  trainings: any;
  otherTraining: string;
}

interface FundingRequestInformations {
  training: TrainingForm;
  fundingRequest: FundingRequest | null;
}

interface GetFundingRequestDeps {
  getFundingRequestFromCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, FundingRequest | null>>;
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
}

export const getFundingRequest =
  (deps: GetFundingRequestDeps) =>
  (params: {
    candidacyId: string;
  }): EitherAsync<FunctionalError, FundingRequestInformations> => {
    const getCandidacy = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const getFundingRequest = (candidacy: any) =>
      EitherAsync.fromPromise(() =>
        deps.getFundingRequestFromCandidacyId(params)
      )
        .ifLeft(() => console.log("left"))
        .map((fundingRequest: FundingRequest | null) => {
          console.log(candidacy);
          return {
            fundingRequest: fundingRequest && {
              ...fundingRequest,
              basicSkills: fundingRequest.basicSkills.map(
                (b: any) => b.basicSkill
              ),
              trainings: fundingRequest.trainings.map((t: any) => t.training),
            },
            training: {
              individualHourCount: candidacy.individualHourCount,
              collectiveHourCount: candidacy.collectiveHourCount,
              otherTraining: candidacy.otherTraining,
              basicSkills: candidacy.basicSkills.map((b: any) => b.basicSkill),
              trainings: candidacy.trainings.map((t: any) => t.training),
            },
          };
        })
        .mapLeft(
          () =>
            new FunctionalError(
              FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
              `La demande de financement n'est pas possible`
            )
        );

    return getCandidacy.chain((candidacy: any) => getFundingRequest(candidacy));
  };
