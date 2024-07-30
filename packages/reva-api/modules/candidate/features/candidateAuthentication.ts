import { isCertificationAvailable } from "../../referential/features/isCertificationAvailable";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";
import { updateCertification } from "../../candidacy/database/candidacies";
import { updateEmailOfCandidacy } from "../../candidacy/features/updateEmailOfCandidacy";
import { getCertificationById } from "../../referential/features/getCertificationById";
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

export const candidateAuthentication = async ({ token }: { token: string }) => {
  const candidateAuthenticationInput = (await getJWTContent(
    token,
  )) as CandidateAuthenticationInput;

  if (candidateAuthenticationInput.action === "registration") {
    const account = await getCandidateAccountInIAM(
      candidateAuthenticationInput.email,
    );

    if (account) {
      return loginCandidate({
        email: candidateAuthenticationInput.email,
      });
    } else {
      return confirmRegistration({
        candidateRegistrationInput: candidateAuthenticationInput,
      });
    }
  } else if (candidateAuthenticationInput.action === "login") {
    return loginCandidate({
      email: candidateAuthenticationInput.email,
    });
  } else if (candidateAuthenticationInput.action === "confirmEmail") {
    const { previousEmail, newEmail } = candidateAuthenticationInput;
    const candidateUpdated = await updateEmailOfCandidacy({
      previousEmail,
      newEmail,
    });
    return loginCandidate({ email: candidateUpdated.email });
  } else {
    throw new FunctionalError(
      FunctionalCodeError.TECHNICAL_ERROR,
      `Action non reconnue`,
    );
  }
};

const confirmRegistration = async ({
  candidateRegistrationInput,
}: {
  candidateRegistrationInput: CandidateRegistrationInput;
}) => {
  const { certificationId, ...candidate } = candidateRegistrationInput;
  const candidateKeycloakId = await createCandidateAccountInIAM({
    email: candidate.email,
    firstname: candidate.firstname,
    lastname: candidate.lastname,
  });

  let candidateWithCandidacy = (
    await createCandidateWithCandidacy({
      ...candidate,
      keycloakId: candidateKeycloakId,
    })
  )
    .ifLeft(() => {
      throw new FunctionalError(
        FunctionalCodeError.ACCOUNT_WITH_PROFILE_NOT_CREATED,
        `Erreur lors de la création du compte avec le profil`,
      );
    })
    .unsafeCoerce();

  // if the candidate has selected a certification during its registration, we assign it if it's available in his department
  if (
    certificationId &&
    (await isCertificationAvailable({
      certificationId,
    }))
  ) {
    const certification = await getCertificationById({ certificationId });
    await updateCertification({
      candidacyId: candidateWithCandidacy.candidacies[0].id,
      author: "candidate",
      certificationId,
      departmentId: candidateRegistrationInput.departmentId,
      feasibilityFormat: (await certification).feasibilityFormat,
    });

    //reload candidate and candidacy after certification update
    candidateWithCandidacy = (
      await getCandidateWithCandidacyFromKeycloakId(candidateKeycloakId)
    ).unsafeCoerce();
  }

  const tokens = await generateIAMToken(candidateKeycloakId);
  const iamToken = {
    tokens,
    candidate: {
      ...candidateWithCandidacy,
      candidacy: candidateWithCandidacy.candidacies[0],
    },
  };

  await logCandidacyAuditEvent({
    candidacyId: candidateWithCandidacy.candidacies[0].id,
    eventType: "CANDIDATE_REGISTRATION_CONFIRMED",
    userRoles: [],
    userKeycloakId: candidateKeycloakId,
    userEmail: candidate.email,
  });

  return iamToken;
};

const loginCandidate = async ({ email }: { email: string }) => {
  const account = await getCandidateAccountInIAM(email);

  if (!account) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
      `Candidat non trouvé`,
    );
  }
  const candidateWithCandidacy = (
    await getCandidateWithCandidacyFromKeycloakId(account?.id || "")
  )
    .ifLeft(() => {
      throw new FunctionalError(
        FunctionalCodeError.CANDIDATE_NOT_FOUND,
        `Candidat avec candidature non trouvé`,
      );
    })
    .unsafeCoerce() as Candidate & {
    keycloakId: string;
    candidacies: unknown[];
  };

  const tokens = await generateIAMToken(candidateWithCandidacy.keycloakId);
  const iamToken = {
    tokens,
    candidate: {
      ...candidateWithCandidacy,
      candidacy: candidateWithCandidacy.candidacies[0],
    },
  };

  return iamToken;
};
