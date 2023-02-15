import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { SubscriptionRequest } from "./types";

interface getSubscriptionRequestsDeps {
  getSubscriptionRequests: () => Promise<Either<string, Array<Partial<SubscriptionRequest>>>>;
}

export const getSubscriptionRequests = async (
  deps: getSubscriptionRequestsDeps,
) =>
  EitherAsync.fromPromise(() => deps.getSubscriptionRequests()).mapLeft(
    (err: string) =>
      new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, err)
  );
