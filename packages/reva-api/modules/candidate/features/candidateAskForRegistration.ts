import { generateJwt } from "../auth.helper";
import { sendRegistrationEmail } from "../mails/sendRegistrationEmail";

interface CandidateInput {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  certificationId?: string;
}

export const askForRegistration = async (params: CandidateInput) => {
  const token = generateJwt({ ...params, action: "registration" }, 3 * 60 * 60);
  return sendRegistrationEmail(params.email, token);
};
