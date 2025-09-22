import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendFeasibilityIncompleteToCandidateAutonomeEmail = async ({
  email,
  comment,
  certificationAuthorityLabel,
  certificationName,
}: {
  email: string;
  comment?: string;
  certificationAuthorityLabel: string;
  certificationName: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 514,
    params: {
      certificationAuthorityLabel,
      certificationName,
      comment: comment,
    },
  });
