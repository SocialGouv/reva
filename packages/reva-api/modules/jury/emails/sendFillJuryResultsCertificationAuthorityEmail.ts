import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

const adminBaseUrl =
  process.env.ADMIN_REACT_BASE_URL || "https://vae.gouv.fr/admin2";

export const sendFillJuryResultsCertificationAuthorityEmail = async ({
  emails,
}: {
  emails: string[];
}) =>
  sendEmailUsingTemplate({
    to: emails.map((email) => ({ email })),
    templateId: 588,
    params: {
      candidaciesUrl: `${adminBaseUrl}/candidacies/juries/?page=1&CATEGORY=PASSED`,
    },
  });
