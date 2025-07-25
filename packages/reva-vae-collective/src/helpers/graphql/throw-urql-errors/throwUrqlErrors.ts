import { OperationResult } from "@urql/core";

export const throwUrqlErrors = <T>(
  urqlResult: OperationResult<T>,
): OperationResult<T> => {
  if (urqlResult.error) {
    throw new Error(urqlResult.error?.message);
  }
  return urqlResult;
};
