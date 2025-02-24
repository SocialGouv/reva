import { generateJwt } from "../auth.helper";
import { getCandidateAppUrl } from "../utils/candidate.helpers";

export const getCandidateLoginUrl = ({
  candidateEmail,
}: {
  candidateEmail: string;
}) => {
  const token = generateJwt(
    { email: candidateEmail, action: "login" },
    1 * 60 * 60 * 24 * 4,
  );
  return `${getCandidateAppUrl()}/login?token=${token}`;
};
