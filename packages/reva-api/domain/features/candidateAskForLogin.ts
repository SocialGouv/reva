import { Either, EitherAsync } from "purify-ts";

import { CandidateLoginInput } from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface AskForLoginDeps {
  generateJWTForLogin: (
    params: CandidateLoginInput
  ) => Promise<Either<string, string>>;
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

  return generateJWTForLogin.chain((token: string) =>
    sendLoginEmail({ email, token })
  );
};
