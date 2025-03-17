import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import {
  generateIAMTokenWithPassword,
  getCandidateAccountInIAM,
} from "../auth.helper";
import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const candidateLoginWithCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
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

  const tokens = generateIAMTokenWithPassword(candidate.keycloakId, password);

  return {
    tokens,
    candidate,
  };
};
