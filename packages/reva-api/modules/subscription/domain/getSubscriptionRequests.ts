import { Either, EitherAsync, Left, Right } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { processPaginationInfo } from "../../shared/list/pagination";

interface getSubscriptionRequestsDeps {
  getSubscriptionRequests: (
    params: GetSubscriptionRequestsParams
  ) => Promise<Either<string, Array<Partial<SubscriptionRequest>>>>;
  getSubscriptionRequestsCount: (
    params: GetSubscriptionRequestsParams
  ) => Promise<Either<string, number>>;
}

export const getSubscriptionRequests = async (
  deps: getSubscriptionRequestsDeps,
  params: GetSubscriptionRequestsParams
): Promise<Either<FunctionalError, PaginatedListResult<SubscriptionRequest>>> =>
  EitherAsync.fromPromise(async () => {
    const eitherSubReqCount = await deps.getSubscriptionRequestsCount(params);
    if (eitherSubReqCount.isLeft()) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          eitherSubReqCount.extract()
        )
      );
    }
    const eitherSubReqList = await deps.getSubscriptionRequests(params);
    if (eitherSubReqList.isLeft()) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          eitherSubReqList.extract()
        )
      );
    }
    return Right({
      rows: eitherSubReqList.extract() as SubscriptionRequest[],
      info: processPaginationInfo({
        limit: params.limit,
        offset: params.offset,
        totalRows: eitherSubReqCount.extract() as number,
      }),
    });
  });
