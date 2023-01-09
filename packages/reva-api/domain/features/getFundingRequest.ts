import { Either, EitherAsync, Left } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy } from "../types/candidacy";
import { FundingRequest, FundingRequestInformations } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetFundingRequestDeps {
  hasRole: (role: Role) => boolean;
  getFundingRequestFromCandidacyId: (params: {
    candidacyId: string;
  }) => Promise<Either<string, FundingRequest | null>>;
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
}

export const getFundingRequest =
  (deps: GetFundingRequestDeps) =>
  async (params: {
    candidacyId: string;
  }): Promise<Either<FunctionalError, FundingRequestInformations>> => {
    if (!deps.hasRole("admin") && !deps.hasRole("manage_candidacy")) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'avez pas accès à la demande de financement de cette candidature`
        )
      );
    }

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
        .map((fundingRequest: FundingRequest | null) => {
          return {
            fundingRequest: fundingRequest && {
              ...fundingRequest,
              basicSkills: fundingRequest.basicSkills.map(
                (b: any) => b.basicSkill
              ),
              mandatoryTrainings: fundingRequest.mandatoryTrainings.map(
                (t: any) => t.training
              ),
            },
            training: {
              certificateSkills: candidacy.certificateSkills || "",
              individualHourCount: candidacy.individualHourCount || 0,
              collectiveHourCount: candidacy.collectiveHourCount || 0,
              otherTraining: candidacy.otherTraining || "",
              basicSkills: candidacy.basicSkills.map((b: any) => b.basicSkill),
              mandatoryTrainings: candidacy.trainings.map(
                (t: any) => t.training
              ),
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
