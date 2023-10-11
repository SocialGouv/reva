import { Either, Maybe } from "purify-ts";

import { IAMAccount } from "../../account/account.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import {
  Candidate,
  CandidateAuthenticationInput,
  CandidateRegistrationInput,
} from "../candidate.types";

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
    const candidateAuthenticationInput = (
      await deps.extractCandidateFromToken(params.token)
    )
      .ifLeft((e) => {
        throw new FunctionalError(
          FunctionalCodeError.CANDIDATE_INVALID_TOKEN,
          e
        );
      })
      .unsafeCoerce();

    if (candidateAuthenticationInput.action === "registration") {
      const account = (
        await deps.getCandidateIdFromIAM(candidateAuthenticationInput.email)
      )
        .ifLeft((e) => {
          throw new FunctionalError(
            FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
            e
          );
        })
        .unsafeCoerce()
        .extractNullable();

      if (account) {
        return loginCandidate(deps)({
          email: candidateAuthenticationInput.email,
        });
      } else {
        return confirmRegistration(deps)({
          candidate: candidateAuthenticationInput,
        });
      }
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
  };

const confirmRegistration =
  (deps: ConfirmRegistrationDeps) =>
  async (params: { candidate: CandidateRegistrationInput }) => {
    const candidateKeycloakId = (
      await deps.createCandidateInIAM({
        email: params.candidate.email,
        firstname: params.candidate.firstname,
        lastname: params.candidate.lastname,
      })
    )
      .ifLeft((e) => {
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_IN_IAM_NOT_CREATED,
          `Erreur lors de la création du compte sur l'IAM`
        );
      })
      .unsafeCoerce();

    const candidateWithCandidacy = (
      await deps.createCandidateWithCandidacy({
        ...params.candidate,
        keycloakId: candidateKeycloakId,
      })
    )
      .ifLeft(() => {
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_WITH_PROFILE_NOT_CREATED,
          `Erreur lors de la création du compte avec le profil`
        );
      })
      .unsafeCoerce();

    const iamToken = (await deps.generateIAMToken(candidateKeycloakId))
      .map((tokens: { accessToken: string; refreshToken: string }) => ({
        tokens,
        candidate: {
          ...candidateWithCandidacy,
          candidacy: candidateWithCandidacy.candidacies[0],
        },
      }))
      .ifLeft(() => {
        throw new FunctionalError(
          FunctionalCodeError.IAM_TOKEN_NOT_GENERATED,
          `Erreur lors de la génération de l'access token`
        );
      })
      .unsafeCoerce();

    return iamToken;
  };

const loginCandidate =
  (deps: ConfirmLoginDeps) => async (params: { email: string }) => {
    const account = (await deps.getCandidateIdFromIAM(params.email))
      .ifLeft((e) => {
        throw new FunctionalError(
          FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
          e
        );
      })
      .unsafeCoerce()
      .extractNullable();

    if (!account) {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
        `Candidat non trouvé`
      );
    }
    const candidateWithCandidacy = (
      await deps.getCandidateWithCandidacy(account.id)
    )
      .ifLeft((e) => {
        throw new FunctionalError(
          FunctionalCodeError.CANDIDATE_NOT_FOUND,
          `Candidat avec candidature non trouvé`
        );
      })
      .unsafeCoerce() as Candidate & {
      keycloakId: string;
      candidacies: unknown[];
    };

    const iamToken = (
      await deps.generateIAMToken(candidateWithCandidacy.keycloakId)
    )
      .map(
        (tokens: {
          accessToken: string;
          refreshToken: string;
          idToken: string;
        }) => ({
          tokens,
          candidate: {
            ...candidateWithCandidacy,
            candidacy: candidateWithCandidacy.candidacies[0],
          },
        })
      )
      .ifLeft(() => {
        throw new FunctionalError(
          FunctionalCodeError.IAM_TOKEN_NOT_GENERATED,
          `Erreur lors de la génération de l'access token`
        );
      })
      .unsafeCoerce();

    return iamToken;
  };
