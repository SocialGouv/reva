import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

import { TypeAccompagnement } from "../candidate.types";
import { getCandidateRegistrationUrl } from "../utils/candidate.url.helpers";

export const sendRegistrationEmailToCandidateAccompagne = async (args: {
  email: string;
  phone: string;
  firstname: string;
  lastname: string;
  departmentId: string;
  certificationId?: string;
  typeAccompagnement: TypeAccompagnement;
  cohorteVaeCollectiveId?: string;
}) =>
  sendEmailUsingTemplate({
    to: { email: args.email },
    templateId: 505,
    params: { candidateRegistrationUrl: getCandidateRegistrationUrl(args) },
  });
