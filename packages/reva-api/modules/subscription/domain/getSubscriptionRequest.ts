import { Either, EitherAsync, Maybe } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";

interface getSubscriptionRequestsDeps {
  getSubscriptionRequestById: (
    id: string
  ) => Promise<Either<string, Maybe<SubscriptionRequest>>>;
}

export const getSubscriptionRequest = async (
  deps: getSubscriptionRequestsDeps,
  id: string
) =>
  EitherAsync.fromPromise(() => deps.getSubscriptionRequestById(id))
    .mapLeft(
      (err: string) =>
        new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, err)
    )
    .map((maybeSubReq) => maybeSubReq.extractNullable());
