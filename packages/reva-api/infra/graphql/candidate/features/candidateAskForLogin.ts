import { Either, EitherAsync } from "purify-ts";

import { CandidateLoginInput } from "../../../../domain/types/candidate";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface AskForLoginDeps {
  doesUserExists: (params: { userEmail: string }) => Promise<boolean>;
  generateJWTForLogin: (
    params: CandidateLoginInput
  ) => Promise<Either<string, string>>;
  sendUnknownUserEmail: (params: {
    email: string;
  }) => Promise<Either<string, string>>;
  sendLoginEmail: (params: {
    email: string;
    token: string;
  }) => Promise<Either<string, string>>;
}

export const askForLogin = (deps: AskForLoginDeps) => async (email: string) => {
  const generateJWTForLogin = EitherAsync.fromPromise(() =>
    deps.generateJWTForLogin({ email, action: "login" })
  ).mapLeft(
    (error) =>
      new FunctionalError(
        FunctionalCodeError.CANDIDATE_JWT_GENERATION_ERROR,
        error
      )
  );

  const sendLoginEmail = (params: { email: string; token: string }) =>
    EitherAsync.fromPromise(() => deps.sendLoginEmail(params)).mapLeft(
      (error) =>
        new FunctionalError(
          FunctionalCodeError.CANDIDATE_LOGIN_EMAIL_ERROR,
          error
        )
    );

  const sendMagicLinkEmail = () =>
    generateJWTForLogin.chain((token: string) =>
      sendLoginEmail({ email, token })
    );

  const sendUnknownUserEmail = () =>
    EitherAsync.fromPromise(() => deps.sendUnknownUserEmail({ email })).mapLeft(
      (error) =>
        new FunctionalError(
          FunctionalCodeError.CANDIDATE_LOGIN_EMAIL_ERROR,
          error
        )
    );

  return (await deps.doesUserExists({ userEmail: email }))
    ? sendMagicLinkEmail()
    : sendUnknownUserEmail();
};
