import { generateJwt } from "../auth.helper";
import { CANDIDATE_APP_URL } from "../utils/candidate.helpers";

export const getCandidateLoginUrl = ({
  candidateEmail,
}: {
  candidateEmail: string;
}) => {
  const token = generateJwt(
    { email: candidateEmail, action: "login" },
    1 * 60 * 60 * 24 * 4,
  );
  return `${CANDIDATE_APP_URL}/login?token=${token}`;
};
