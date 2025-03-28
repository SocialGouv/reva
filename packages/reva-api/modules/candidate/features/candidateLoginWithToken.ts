import { prismaClient } from "../../../prisma/client";
import { TokenService } from "../../account/utils/token.service";
import { getKeycloakAdmin } from "../../account/features/getKeycloakAdmin";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import {
  createCandidateAccountInIAM,
  getCandidateAccountInIAM,
  getJWTContent,
} from "../auth.helper";
import {
  CandidateAuthenticationInput,
  CandidateRegistrationInput,
} from "../candidate.types";
import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";
import { createCandidateWithCandidacy } from "./createCandidateWithCandidacy";
import { getFirstActiveCandidacyByCandidateId } from "../../candidacy/features/getFirstActiveCandidacyByCandidateId";
import { isCertificationAvailable } from "../../referential/features/isCertificationAvailable";
import { getCertificationById } from "../../referential/features/getCertificationById";
import { updateCertification } from "../../candidacy/certification/features/updateCertification";
import { logCandidacyAuditEvent } from "../../candidacy-log/features/logCandidacyAuditEvent";

export const candidateLoginWithToken = async ({ token }: { token: string }) => {
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
  const { certificationId, ...candidateInput } = candidateRegistrationInput;
  const candidateKeycloakId = await createCandidateAccountInIAM({
    email: candidateInput.email,
    firstname: candidateInput.firstname,
    lastname: candidateInput.lastname,
  });

  const candidate = await createCandidateWithCandidacy({
    ...candidateInput,
    keycloakId: candidateKeycloakId,
  });

  const candidacy = await getFirstActiveCandidacyByCandidateId({
    candidateId: candidate.id,
  });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  // if the candidate has selected a certification during its registration, we assign it if it's available
  if (
    certificationId &&
    (await isCertificationAvailable({
      certificationId,
    }))
  ) {
    const certification = await getCertificationById({ certificationId });
    if (!certification) {
      throw new Error("Certification non trouvée");
    }

    await updateCertification({
      candidacyId: candidacy.id,
      author: "candidate",
      certificationId,
      feasibilityFormat:
        candidacy.typeAccompagnement === "ACCOMPAGNE"
          ? certification.feasibilityFormat
          : "UPLOADED_PDF",
    });
  }

  const url = getImpersonateUrl(candidate.keycloakId);

  await logCandidacyAuditEvent({
    candidacyId: candidacy.id,
    eventType: "CANDIDATE_REGISTRATION_CONFIRMED",
    userRoles: [],
    userKeycloakId: candidateKeycloakId,
    userEmail: candidateInput.email,
  });

  return url;
};

const loginCandidate = async ({ email }: { email: string }) => {
  const account = await getCandidateAccountInIAM(email);

  if (!account) {
    throw new FunctionalError(
      FunctionalCodeError.ACCOUNT_IN_IAM_NOT_FOUND,
      `Candidat non trouvé`,
    );
  }

  const candidate = await getCandidateByKeycloakId({
    keycloakId: account?.id || "",
  });

  if (!candidate) {
    throw new Error("Candidat non trouvé");
  }

  // Track last login via magic link
  await prismaClient.candidate.update({
    where: { id: candidate.id },
    data: { lastLoginViaMagicLinkAt: new Date() },
  });

  const url = getImpersonateUrl(candidate.keycloakId);

  return url;
};

const getImpersonateUrl = async (
  keycloakId: string,
): Promise<string | undefined> => {
  const baseUrl = process.env.BASE_URL || "https://vae.gouv.fr";

  const token = await getImpersonateTokenForCandidate(keycloakId);
  return `${baseUrl}/api/account/impersonate?token=${token}`;
};

const getImpersonateTokenForCandidate = async (
  keycloakId: string,
): Promise<string> => {
  const keycloakAdmin = await getKeycloakAdmin();

  // Check if candidate with candidateToUpdate.keycloakId exsits
  const keycloakAccount = await keycloakAdmin.users.findOne({
    id: keycloakId,
    realm: process.env.KEYCLOAK_APP_REALM,
  });

  if (!keycloakAccount) {
    throw new Error(
      `Compte utilisateur keycloak pour l'id ${keycloakId} non trouvé`,
    );
  }

  const token = TokenService.getInstance().getToken({
    candidateId: keycloakId,
  });

  return token;
};
