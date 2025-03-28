import { prismaClient } from "../../../prisma/client";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import {
  getCandidateAccountInIAM,
  getJWTContent,
  resetPassword,
} from "../auth.helper";
import { CandidateResetPasswordInput } from "../candidate.types";
import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const candidateResetPassword = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  const candidateAuthenticationInput = (await getJWTContent(
    token,
  )) as CandidateResetPasswordInput;

  if (candidateAuthenticationInput.action === "reset-password") {
    const account = await getCandidateAccountInIAM(
      candidateAuthenticationInput.email,
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

    await resetPassword(candidate.keycloakId, password);

    // Track password update
    await prismaClient.candidate.update({
      where: { id: candidate.id },
      data: { passwordUpdatedAt: new Date() },
    });
  } else {
    throw new FunctionalError(
      FunctionalCodeError.TECHNICAL_ERROR,
      `Action non reconnue`,
    );
  }
};
