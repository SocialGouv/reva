import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendCandidacyTransferToCandidate = async ({
  email,
  newCertificationAuthorityName,
}: {
  email: string;
  newCertificationAuthorityName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 596,
    params: {
      newCertificationAuthorityName,
    },
  });
};
