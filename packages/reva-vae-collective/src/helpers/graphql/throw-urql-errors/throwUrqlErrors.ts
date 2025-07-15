import { OperationResult } from "@urql/core";

export const throwUrqlErrors = (urqlResult: OperationResult) => {
  if (urqlResult.error) {
    throw new Error(urqlResult.error?.message);
  }
  return urqlResult;
};
