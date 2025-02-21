import { generateJwt } from "../auth.helper";

export const getCandidateLoginUrl = ({
  candidateEmail,
}: {
  candidateEmail: string;
}) => {
  const token = generateJwt(
    { email: candidateEmail, action: "login" },
    1 * 60 * 60 * 24 * 4,
  );
  return `${process.env.BASE_URL}/candidat/login?token=${token}`;
};
