import { Either, EitherAsync, Maybe, Right } from "purify-ts";

import { IAMAccount } from "../types/account";
import { Candidacy } from "../types/candidacy";
import {
  Candidate,
  CandidateAuthenticationInput,
  CandidateRegistrationInput,
} from "../types/candidate";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface CommonDeps {
  getCandidateIdFromIAM: (
    email: string
  ) => Promise<Either<string, Maybe<IAMAccount>>>;
  generateIAMToken: (id: string) => any;
}

interface ConfirmRegistrationDeps extends CommonDeps {
  extractCandidateFromToken: (
    token: string
  ) => Promise<Either<string, CandidateAuthenticationInput>>;
  createCandidateInIAM: (params: {
    email: string;
    firstname: string;
    lastname: string;
  }) => Promise<Either<string, string>>;
  createCandidateWithCandidacy: any;
}

interface ConfirmLoginDeps extends CommonDeps {
  extractEmailFromToken: (token: string) => Promise<Either<string, string>>;
  getCandidateWithCandidacy: (
    keycloakId: string
  ) => Promise<Either<string, Candidate>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface CandidateAuthenticationDeps
  extends ConfirmRegistrationDeps,
    ConfirmLoginDeps {}

export const candidateAuthentication =
  (deps: CandidateAuthenticationDeps) => async (params: any) => {
    return EitherAsync.fromPromise(() =>
      deps.extractCandidateFromToken(params.token)
    )
      .mapLeft(
        (error) =>
          new FunctionalError(
            FunctionalCodeError.CANDIDATE_INVALID_TOKEN,
            error
          )
      )
      .chain(
        async (candidateAuthenticationInput: CandidateAuthenticationInput) => {
          if (candidateAuthenticationInput.action === "registration") {
            return EitherAsync.fromPromise(() =>
              deps.getCandidateIdFromIAM(candidateAuthenticationInput.email)
            )
              .mapLeft(
                (error) =>
                  new FunctionalError(
                    FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
                    error
                  )
              )
              .chain(async (maybeAccount: Maybe<IAMAccount>) => {
                if (maybeAccount.isJust()) {
                  return loginCandidate(deps)({
                    email: candidateAuthenticationInput.email,
                  });
                } else {
                  return confirmRegistration(deps)({
                    candidate: candidateAuthenticationInput,
                  });
                }
              });
          } else if (candidateAuthenticationInput.action === "login") {
            return loginCandidate(deps)({
              email: candidateAuthenticationInput.email,
            });
          } else {
            throw new FunctionalError(
              FunctionalCodeError.TECHNICAL_ERROR,
              `Action non reconnue`
            );
          }
        }
      );
  };

const confirmRegistration =
  (deps: ConfirmRegistrationDeps) =>
  async (params: { candidate: CandidateRegistrationInput }) => {
    const createCandidateInIAM = (candidate: Candidate) =>
      EitherAsync.fromPromise(() =>
        deps.createCandidateInIAM({
          email: candidate.email,
          firstname: candidate.firstname,
          lastname: candidate.lastname,
        })
      )
        .mapLeft(
          () =>
            new FunctionalError(
              FunctionalCodeError.ACCOUNT_IN_IAM_NOT_CREATED,
              `Erreur lors de la création du compte sur l'IAM`
            )
        )
        .map((keycloakId: string) => {
          return { ...candidate, keycloakId };
        });

    const createCandidateWithCandidacy = (
      candidate: Candidate & { keycloakId: string }
    ) =>
      EitherAsync.fromPromise(() => {
        return deps.createCandidateWithCandidacy(candidate);
      }).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.ACCOUNT_WITH_PROFILE_NOT_CREATED,
            `Erreur lors de la création du compte avec le profil`
          )
      );

    const generateIAMToken = (candidate: any) =>
      EitherAsync.fromPromise(async () => {
        return (await deps.generateIAMToken(candidate.keycloakId)).map(
          (tokens: { accessToken: string; refreshToken: string }) => ({
            tokens,
            candidate: { ...candidate, candidacy: candidate.candidacies[0] },
          })
        );
      }).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.IAM_TOKEN_NOT_GENERATED,
            `Erreur lors de la génération de l'access token`
          )
      );

    return createCandidateInIAM(params.candidate)
      .chain(createCandidateWithCandidacy)
      .chain(generateIAMToken);
  };

const loginCandidate =
  (deps: ConfirmLoginDeps) => async (params: { email: string }) => {
    const maybeCandidateInIAM = EitherAsync.fromPromise(() =>
      deps.getCandidateIdFromIAM(params.email)
    )
      .mapLeft(
        (error) =>
          new FunctionalError(
            FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
            error
          )
      )
      .chain(async (maybeAccount: Maybe<IAMAccount>) => {
        if (maybeAccount.isNothing()) {
          throw new FunctionalError(
            FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
            `Candidat non trouvé`
          );
        }

        return Right(maybeAccount.extract() as IAMAccount);
      });

    const getCandidateWithCandidacy = (candidateAccount: IAMAccount) =>
      EitherAsync.fromPromise(() => {
        return deps.getCandidateWithCandidacy(candidateAccount.id);
      }).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDATE_NOT_FOUND,
            `Candidat avec candidature non trouvé`
          )
      );

    const generateIAMToken = (candidate: any) =>
      EitherAsync.fromPromise(async () => {
        return (await deps.generateIAMToken(candidate.keycloakId)).map(
          (tokens: {
            accessToken: string;
            refreshToken: string;
            idToken: string;
          }) => ({
            tokens,
            candidate: { ...candidate, candidacy: candidate.candidacies[0] },
          })
        );
      }).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.IAM_TOKEN_NOT_GENERATED,
            `Erreur lors de la génération de l'access token`
          )
      );

    return maybeCandidateInIAM
      .chain(getCandidateWithCandidacy)
      .chain(generateIAMToken);
  };
