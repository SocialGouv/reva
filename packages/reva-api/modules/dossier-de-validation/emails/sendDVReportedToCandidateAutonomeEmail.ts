import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendDVReportedToCandidateAutonomeEmail = async ({
  email,
  decisionComment,
  certificationName,
  certificationAuthorityLabel,
}: {
  email: string;
  decisionComment?: string;
  certificationName: string;
  certificationAuthorityLabel: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 517,
    params: {
      certificationAuthorityLabel,
      certificationName,
      comment: decisionComment,
    },
  });
