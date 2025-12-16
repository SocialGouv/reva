import { ActiviteStatut, CandidacyStatusStep } from "@prisma/client";

import { TokenService } from "@/modules/account/utils/token.service";
import { updateCertification } from "@/modules/candidacy/certification/features/updateCertification";
import { getFirstActiveCandidacyByCandidateId } from "@/modules/candidacy/features/getFirstActiveCandidacyByCandidateId";
import { updateCandidacyOrganism } from "@/modules/candidacy/features/updateCandidacyOrganism";
import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getCertificationById } from "@/modules/referential/features/getCertificationById";
import { isCertificationAvailable } from "@/modules/referential/features/isCertificationAvailable";
import {
  createAccountInIAM,
  getAccountInIAM,
  getJWTContent,
} from "@/modules/shared/auth/auth.helper";
import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { getCertificationCohortesByCohorteId } from "@/modules/vae-collective/features/getCertificationCohortesByCohorteId";
import { getCohorteVAECollectiveById } from "@/modules/vae-collective/features/getCohorteVAECollectiveById";
import { prismaClient } from "@/prisma/client";

import {
  CandidateAuthenticationInput,
  CandidateRegistrationInput,
} from "../candidate.types";

import { createCandidateWithCandidacy } from "./createCandidateWithCandidacy";
import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const candidateLoginWithToken = async ({ token }: { token: string }) => {
  const candidateAuthenticationInput = (await getJWTContent(
    token,
  )) as CandidateAuthenticationInput;

  if (candidateAuthenticationInput.action === "registration") {
    const account = await getAccountInIAM(
      candidateAuthenticationInput.email,
      process.env.KEYCLOAK_APP_REALM as string,
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
  const candidateKeycloakId = await createAccountInIAM(
    {
      email: candidateInput.email,
      firstname: candidateInput.firstname,
      lastname: candidateInput.lastname,
    },
    process.env.KEYCLOAK_APP_REALM as string,
    ["candidate"],
  );

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

  // special case of registration for a vae collective
  if (candidateInput.cohorteVaeCollectiveId) {
    const cohorteVaeCollective = await getCohorteVAECollectiveById({
      cohorteVaeCollectiveId: candidateInput.cohorteVaeCollectiveId,
    });

    if (!cohorteVaeCollective) {
      throw new Error("Cohorte de VAE Collective non trouvée");
    }

    const certificationCohorteVaeCollective =
      await getCertificationCohortesByCohorteId({
        cohorteVaeCollectiveId: candidateInput.cohorteVaeCollectiveId,
      });

    // if there is only one certification for the vae collective, we assign it
    if (certificationCohorteVaeCollective?.length === 1) {
      const certificationCohorte = certificationCohorteVaeCollective[0];
      await updateCertification({
        candidacyId: candidacy.id,
        author: "candidate",
        certificationId: certificationCohorte.certificationId,
        feasibilityFormat: "DEMATERIALIZED",
      });
    }

    if (!cohorteVaeCollective.organismId) {
      throw new Error("Aucun AAP n'est assigné à cette cohorte");
    }

    //we assign the cohorte organism to the candidacy
    await updateCandidacyOrganism({
      candidacyId: candidacy.id,
      organismId: cohorteVaeCollective.organismId,
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
  const account = await getAccountInIAM(
    email,
    process.env.KEYCLOAK_APP_REALM as string,
  );

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

  // Mise à jour de la date d'activité pour toutes les candidatures actives du candidat
  await prismaClient.candidacy.updateMany({
    where: {
      candidateId: candidate.id,
      status: {
        not: CandidacyStatusStep.ARCHIVE,
      },
      candidacyDropOut: { is: null },
      activite: ActiviteStatut.ACTIF,
    },
    data: { derniereDateActivite: new Date() },
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
