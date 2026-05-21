import {
  createAccountInIAM,
  getAccountInIAM,
  resetPassword,
} from "@/modules/shared/auth/auth.helper";
import { getJWTContent } from "@/modules/shared/auth/jwt.helper";
import { prismaClient } from "@/prisma/client";

import {
  candidateUserHasTotpConfigured,
  generateCandidateIAMTokenWithPassword,
} from "../utils/keycloak.utils";

import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

interface FinalizeRegistrationWithPasswordInput {
  token: string;
  password: string;
}

interface FinalizeRegistrationTokenContent {
  email: string;
  action: "finalize-registration";
}

export const candidateFinalizeRegistrationWithPassword = async ({
  token,
  password,
}: FinalizeRegistrationWithPasswordInput) => {
  const tokenContent = (await getJWTContent(
    token,
  )) as FinalizeRegistrationTokenContent;

  if (tokenContent.action !== "finalize-registration") {
    throw new Error("Action non reconnue");
  }

  const { email } = tokenContent;
  const realm = process.env.KEYCLOAK_APP_REALM as string;

  const existingAccount = await getAccountInIAM(email, realm);
  if (existingAccount) {
    const keycloakId = existingAccount.id;
    if (!keycloakId) {
      throw new Error("Candidat non trouvé");
    }

    const candidate = await getCandidateByKeycloakId({ keycloakId });
    if (!candidate) {
      throw new Error("Candidat non trouvé");
    }

    await resetPassword(keycloakId, password, realm);

    await prismaClient.candidate.update({
      where: { id: candidate.id },
      data: { passwordUpdatedAt: new Date() },
    });

    // Si TOTP enrollé, on skip l'auto-login (cf. candidateResetPassword).
    const isUserHasTotpConfigured =
      await candidateUserHasTotpConfigured(keycloakId);
    if (isUserHasTotpConfigured) {
      return null;
    }

    return generateCandidateIAMTokenWithPassword(keycloakId, password);
  }

  const keycloakId = await createAccountInIAM({ email }, realm);

  await resetPassword(keycloakId, password, realm);

  const defaultDepartment = await prismaClient.department.findFirst({
    where: { code: "75" },
  });

  if (!defaultDepartment) {
    throw new Error("Département par défaut non trouvé");
  }

  await prismaClient.candidate.create({
    data: {
      email,
      keycloakId,
      firstname: "",
      lastname: "",
      phone: "",
      departmentId: defaultDepartment.id,
    },
  });

  return generateCandidateIAMTokenWithPassword(keycloakId, password);
};
