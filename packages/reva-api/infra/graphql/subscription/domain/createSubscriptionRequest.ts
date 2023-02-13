import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { SubscriptionRequest, SubscriptionRequestInput } from "./types";

interface createSubscriptionRequestDeps {
  createSubscriptionRequest: (
    params: any
  ) => Promise<Either<string, SubscriptionRequest>>;
}

export const createSubscriptionRequest = async (
  deps: createSubscriptionRequestDeps,
  params: SubscriptionRequestInput
) =>
  EitherAsync.fromPromise(() => deps.createSubscriptionRequest(params)).mapLeft(
    (err: string) =>
      new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, err)
  );
