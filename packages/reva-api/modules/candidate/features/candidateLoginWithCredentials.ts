import { ActiviteStatut, CandidacyStatusStep } from "@prisma/client";

import {
  generateIAMTokenWithPassword,
  getAccountInIAM,
} from "@/modules/shared/auth/auth.helper";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { prismaClient } from "@/prisma/client";

import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const candidateLoginWithCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
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

  // Track last login via password
  await prismaClient.candidate.update({
    where: { id: candidate.id },
    data: { lastLoginViaPasswordAt: new Date() },
  });

  // Mise à jour de la date d'activité pour toutes les candidatures actives du candidat
  await prismaClient.candidacy.updateMany({
    where: {
      candidateId: candidate.id,
      status: {
        not: CandidacyStatusStep.ARCHIVE,
      },
      activite: ActiviteStatut.ACTIF,
      candidacyDropOut: { is: null },
    },
    data: { derniereDateActivite: new Date() },
  });

  const tokens = generateIAMTokenWithPassword(
    candidate.keycloakId,
    password,
    process.env.KEYCLOAK_APP_REALM as string,
  );

  return {
    tokens,
    candidate,
  };
};
