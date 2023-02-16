import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface getSubscriptionRequestsDeps {
  getSubscriptionRequests: (params: GetSubscriptionRequestsParams) => Promise<Either<string, Array<Partial<SubscriptionRequest>>>>;
}


export const getSubscriptionRequests = async (
  deps: getSubscriptionRequestsDeps,
  params: GetSubscriptionRequestsParams,
) =>
  EitherAsync.fromPromise(() => deps.getSubscriptionRequests(params)).mapLeft(
    (err: string) =>
      new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, err)
  );
