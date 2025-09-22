import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendCandidacyTransferToPreviousCertificationAuthorityEmail =
  async ({
    email,
    previousCertificationAuthorityName,
    candidateName,
    newCertificationAuthorityName,
  }: {
    email: string;
    previousCertificationAuthorityName: string;
    candidateName: string;
    newCertificationAuthorityName: string;
  }) => {
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 570,
      params: {
        previousCertificationAuthorityName,
        candidateName,
        newCertificationAuthorityName,
      },
    });
  };
