import { generateJwt } from "../auth.helper";
import { TypeAccompagnement } from "../candidate.types";

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
  return `${process.env.BASE_URL}/candidat/registration?token=${token}`;
};
