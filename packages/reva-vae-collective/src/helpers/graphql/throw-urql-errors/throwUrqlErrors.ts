import { OperationResult } from "@urql/core";

class UnauthenticatedError extends Error {
  constructor() {
    super("Votre session a expiré, veuillez vous reconnecter.");
    this.name = "UnauthenticatedError";
  }
}

export const throwUrqlErrors = <T>(
  urqlResult: OperationResult<T>,
): OperationResult<T> => {
  if (urqlResult.error) {
    const isUnauthenticatedError = urqlResult.error.graphQLErrors.some(
      (e) => e.extensions.code === "UNAUTHENTICATED",
    );

    if (isUnauthenticatedError) {
      throw new UnauthenticatedError();
    }

    throw new Error(urqlResult.error?.message);
  }
  return urqlResult;
};
