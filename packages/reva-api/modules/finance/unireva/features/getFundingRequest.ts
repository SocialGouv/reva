import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../shared/error/functionalError";
import { FundingRequest, FundingRequestInformations } from "../finance.types";
import { getCandidacyFromId } from "../../../candidacy/database/candidacies";

import { getFundingRequest as getFundingRequestDb } from "../database/fundingRequests";

export const getFundingRequest = async (params: {
  candidacyId: string;
}): Promise<Either<FunctionalError, FundingRequestInformations>> => {
  const getCandidacy = EitherAsync.fromPromise(() =>
    getCandidacyFromId(params.candidacyId),
  ).mapLeft(
    () =>
      new FunctionalError(
        FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
        `Aucune candidature n'a été trouvée`,
      ),
  );

  const getFundingRequest = (candidacy: any) =>
    EitherAsync.fromPromise(() => getFundingRequestDb(params))
      .map((fundingRequest: FundingRequest | null) => {
        return {
          fundingRequest: fundingRequest && {
            ...fundingRequest,
            basicSkills: fundingRequest.basicSkills.map(
              (b: any) => b.basicSkill,
            ),
            mandatoryTrainings: fundingRequest.mandatoryTrainings.map(
              (t: any) => t.training,
            ),
          },
          training: {
            certificateSkills: candidacy.certificateSkills || "",
            individualHourCount: candidacy.individualHourCount || 0,
            collectiveHourCount: candidacy.collectiveHourCount || 0,
            otherTraining: candidacy.otherTraining || "",
            basicSkills: candidacy.basicSkills.map((b: any) => b.basicSkill),
            mandatoryTrainings: candidacy.trainings.map((t: any) => t.training),
          },
        };
      })
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.FUNDING_REQUEST_NOT_POSSIBLE,
            `La demande de financement n'est pas possible`,
          ),
      );

  return getCandidacy.chain((candidacy: any) => getFundingRequest(candidacy));
};
