import { generateJwt } from "../auth.helper";
import { TypeAccompagnement } from "../candidate.types";
import {
  sendRegistrationEmailToCandidateAccompagne,
  sendRegistrationEmailToCandidateAutonome,
} from "../emails";

interface CandidateInput {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  certificationId?: string;
  typeAccompagnement: TypeAccompagnement;
}

export const askForRegistration = async (params: CandidateInput) => {
  const token = generateJwt({ ...params, action: "registration" }, 3 * 60 * 60);
  if (params.typeAccompagnement === "AUTONOME") {
    return sendRegistrationEmailToCandidateAutonome(params.email, token);
  }
  return sendRegistrationEmailToCandidateAccompagne(params.email, token);
};
