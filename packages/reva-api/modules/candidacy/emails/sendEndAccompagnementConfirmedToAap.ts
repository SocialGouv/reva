import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendEndAccompagnementConfirmedToAap = async ({
  email,
  aapLabel,
  candidateFullName,
  endAccompagnementDate,
  candidacyUrl,
}: {
  email: string;
  aapLabel: string;
  candidateFullName: string;
  endAccompagnementDate: string;
  candidacyUrl: string;
}) =>
  sendEmailUsingTemplate({
    to: { email },
    templateId: 638,
    params: {
      aapLabel,
      candidateFullName,
      endAccompagnementDate,
      candidacyUrl,
    },
  });
