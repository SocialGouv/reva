import debug from "debug";
import mercurius from "mercurius";
import { Either, EitherAsync, Left, Right } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { Resolver, ResolverArgs, ResolverDict } from "../types";

const log = debug("gql:security");

export type SecurityCheck = (
  ...args: ResolverArgs
) => EitherAsync<FunctionalError, boolean>;

export const applySecurityChecksToResolvers = (
  securityChecks: SecurityCheck[],
  resolvers: ResolverDict
): ResolverDict => {
  const newMutations: ResolverDict = {};
  const securityChecksChain = chainSecurityChecks(securityChecks);
  for (const key of Object.keys(resolvers)) {
    const resolver = resolvers[key];
    newMutations[key] = applySecurityCheckToResolver(
      securityChecksChain,
      resolver
    );
  }
  return newMutations;
};

export const applySecurityChecksToResolver = (
  securityChecks: SecurityCheck[],
  resolver: Resolver<any>
) => {
  const securityChecksChain = chainSecurityChecks(securityChecks);
  return applySecurityCheckToResolver(securityChecksChain, resolver);
};

export const applySecurityCheckToResolver = (
  securityCheck: SecurityCheck,
  resolver: Resolver<unknown>
): Resolver<unknown> => {
  return (...args) => {
    return EitherAsync.fromPromise(() => securityCheck(...args))
      .mapLeft(
        (err) =>
          new mercurius.ErrorWithProps(
            err.message,
            new FunctionalError(FunctionalCodeError.NOT_AUTHORIZED, err.message)
          )
      )
      .chain((_isAllowed: boolean) => resolverToEitherAsync(resolver, ...args))
      .run()
      .then((eitherResult) => eitherResult.extract());
  };
};

const chainSecurityChecks =
  (securityChecks: SecurityCheck[]): SecurityCheck =>
  (...args: ResolverArgs) =>
    securityChecks.reduce<EitherAsync<FunctionalError, boolean>>(
      (checksChain, currentCheck, index) => {
        return index > 0
          ? checksChain.chain(() => currentCheck(...args))
          : checksChain;
      },
      securityChecks[0](...args)
    );

function resolverToEitherAsync<T>(
  resolver: Resolver<T>,
  ...args: ResolverArgs
): EitherAsync<mercurius.ErrorWithProps, T> {
  return EitherAsync.fromPromise(
    async (): Promise<Either<mercurius.ErrorWithProps, T>> => {
      const result = await resolver(...args);
      if (result instanceof mercurius.ErrorWithProps) {
        return Left(result);
      }
      return Right(result);
    }
  );
}
