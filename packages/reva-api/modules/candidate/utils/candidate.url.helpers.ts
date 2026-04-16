import { generateJwt } from "@/modules/shared/auth/jwt.helper";

export const getCandidateAppUrl = () => `${process.env.BASE_URL}/candidat`;

export const getCandidateLoginUrl = ({
  candidateEmail,
  jwtValidity = 1 * 60 * 60 * 24 * 4, // 4 days
}: {
  candidateEmail: string;
  jwtValidity?: number;
}) => {
  const token = generateJwt(
    { email: candidateEmail, action: "login" },
    jwtValidity,
  );
  return `${getCandidateAppUrl()}/login?token=${token}`;
};
