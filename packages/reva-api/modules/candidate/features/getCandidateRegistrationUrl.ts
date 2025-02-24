import { generateJwt } from "../auth.helper";
import { TypeAccompagnement } from "../candidate.types";
import { CANDIDATE_APP_URL } from "../utils/candidate.helpers";

export const getCandidateRegistrationUrl = (params: {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  certificationId?: string;
  typeAccompagnement: TypeAccompagnement;
}) => {
  const token = generateJwt({ ...params, action: "registration" }, 3 * 60 * 60);
  return `${CANDIDATE_APP_URL}/registration?token=${token}`;
};
