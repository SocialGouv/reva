import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendLegalInformationDocumentsApprovalEmail = async ({
  email,
  managerName,
}: {
  email: string;
  managerName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 531,
    params: {
      managerName,
    },
  });
};

export const sendLegalInformationDocumentsUpdateNeededEmail = async ({
  email,
  managerName,
  aapComment,
}: {
  email: string;
  managerName: string;
  aapComment: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 532,
    params: {
      managerName,
      aapComment,
      backofficeUrl: getBackofficeUrl({ path: "/" }),
    },
  });
};
