import { generateJwt } from "@/modules/shared/auth/auth.helper";

import { TypeAccompagnement } from "../candidate.types";

export const getCandidateAppUrl = () => `${process.env.BASE_URL}/candidat`;

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

export const getCandidateRegistrationUrl = (params: {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  certificationId?: string;
  typeAccompagnement: TypeAccompagnement;
  cohorteVaeCollectiveId?: string;
}) => {
  const token = generateJwt({ ...params, action: "registration" }, 3 * 60 * 60);
  return `${getCandidateAppUrl()}/registration?token=${token}`;
};
