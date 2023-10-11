import KeycloakAdminClient from "@keycloak/keycloak-admin-client";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import {
  createCandidateAccountInIAM,
  generateIAMToken,
  getCandidateAccountInIAM,
  getJWTContent,
} from "../auth.helper";
import {
  Candidate,
  CandidateAuthenticationInput,
  CandidateRegistrationInput,
} from "../candidate.types";
import {
  createCandidateWithCandidacy,
  getCandidateWithCandidacyFromKeycloakId,
} from "../database/candidates";

export const candidateAuthentication = async ({
  token,
  keycloakAdmin,
}: {
  token: string;
  keycloakAdmin: KeycloakAdminClient;
}) => {
  const candidateAuthenticationInput = (await getJWTContent(token))
    .ifLeft((e) => {
      throw new FunctionalError(FunctionalCodeError.CANDIDATE_INVALID_TOKEN, e);
    })
    .unsafeCoerce() as CandidateAuthenticationInput;

  if (candidateAuthenticationInput.action === "registration") {
    const account = (
      await getCandidateAccountInIAM(keycloakAdmin)(
        candidateAuthenticationInput.email
      )
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
      return loginCandidate({
        email: candidateAuthenticationInput.email,
        keycloakAdmin,
      });
    } else {
      return confirmRegistration({
        candidate: candidateAuthenticationInput,
        keycloakAdmin,
      });
    }
  } else if (candidateAuthenticationInput.action === "login") {
    return loginCandidate({
      email: candidateAuthenticationInput.email,
      keycloakAdmin,
    });
  } else {
    throw new FunctionalError(
      FunctionalCodeError.TECHNICAL_ERROR,
      `Action non reconnue`
    );
  }
};

const confirmRegistration = async ({
  candidate,
  keycloakAdmin,
}: {
  candidate: CandidateRegistrationInput;
  keycloakAdmin: KeycloakAdminClient;
}) => {
  const candidateKeycloakId = (
    await createCandidateAccountInIAM(keycloakAdmin)({
      email: candidate.email,
      firstname: candidate.firstname,
      lastname: candidate.lastname,
    })
  )
    .ifLeft(() => {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_IN_IAM_NOT_CREATED,
        `Erreur lors de la création du compte sur l'IAM`
      );
    })
    .unsafeCoerce();

  const candidateWithCandidacy = (
    await createCandidateWithCandidacy({
      ...candidate,
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

  const iamToken = (await generateIAMToken(keycloakAdmin)(candidateKeycloakId))
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

const loginCandidate = async ({
  email,
  keycloakAdmin,
}: {
  email: string;
  keycloakAdmin: KeycloakAdminClient;
}) => {
  const account = (await getCandidateAccountInIAM(keycloakAdmin)(email))
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
    await getCandidateWithCandidacyFromKeycloakId(account.id)
  )
    .ifLeft(() => {
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
    await generateIAMToken(keycloakAdmin)(candidateWithCandidacy.keycloakId)
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
