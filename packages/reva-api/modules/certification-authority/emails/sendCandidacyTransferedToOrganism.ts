import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendCandidacyTransferedToOrganismEmail = async ({
  email,
  organismName,
  candidateName,
  certificationAuthorityName,
}: {
  email: string;
  organismName: string;
  candidateName: string;
  certificationAuthorityName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 540,
    params: {
      backofficeUrl: getBackofficeUrl({ path: "/" }),
      organismName,
      candidateName,
      certificationAuthorityName,
    },
  });
};
