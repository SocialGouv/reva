import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendEndAccompagnementRefusedToAap = async ({
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
    templateId: 639,
    params: {
      aapLabel,
      candidateFullName,
      endAccompagnementDate,
      candidacyUrl,
    },
  });
