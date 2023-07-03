import { Either, EitherAsync, Left, Maybe, Right } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { logger } from "../../../logger";

interface RejectSubscriptionRequestDeps {
  getSubscriptionRequestById: (
    id: string
  ) => Promise<Either<string, Maybe<SubscriptionRequest>>>;
  deleteSubscriptionRequestById: (id: string) => Promise<Either<string, void>>;
  sendRejectionEmail: ({
    email,
    reason,
  }: {
    email: string;
    reason: string;
  }) => Promise<Either<string, string>>;
}
export const rejectSubscriptionRequest = async (
  deps: RejectSubscriptionRequestDeps,
  params: { subscriptionRequestId: string; reason: string }
) => {
  const $store: {
    subreq?: SubscriptionRequest;
  } = {};

  const getSubscriptionRequest = EitherAsync.fromPromise(async () => {
    const eitherSubreq = await deps.getSubscriptionRequestById(
      params.subscriptionRequestId
    );
    if (eitherSubreq.isLeft()) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          eitherSubreq.extract()
        )
      );
    }
    const maybeSubReq = eitherSubreq.extract() as Maybe<SubscriptionRequest>;
    if (maybeSubReq.isNothing()) {
      const errorMessage = `La demande d'inscription ${params.subscriptionRequestId} n'existe pas`;
      logger.error(`[rejectSubscriptionRequestDeps] ${errorMessage}`);
      return Left(
        new FunctionalError(
          FunctionalCodeError.SUBSCRIPTION_REQUEST_NOT_FOUND,
          errorMessage
        )
      );
    }
    const subreq = maybeSubReq.extract() as SubscriptionRequest;
    $store.subreq = subreq;
    return Right(subreq);
  });

  const sendEmail = EitherAsync.fromPromise(() =>
    deps.sendRejectionEmail({
      email: $store.subreq?.accountEmail ?? "",
      reason: params.reason,
    })
  )
    .mapLeft(
      (error: string) =>
        new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
    )
    .ifRight(() => {
      logger.info(
        `[rejectSubscriptionRequestDeps] Successfuly sent rejection mail for subscription request ${$store.subreq?.id}`
      );
    });

  const deleteSubscriptionRequest = EitherAsync.fromPromise(async () =>
    (await deps.deleteSubscriptionRequestById(params.subscriptionRequestId))
      .mapLeft(
        (error: string) =>
          new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, error)
      )
      .ifRight(() => {
        logger.info(
          `[rejectSubscriptionRequestDeps] Successfuly deleted subscriptionRequest ${$store.subreq?.id}`
        );
      })
  );

  return getSubscriptionRequest
    .chain(() => sendEmail)
    .chain(() => deleteSubscriptionRequest);
};
