import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

export const sendNewCertificationAvailableToCertificationRegistryManagerEmail =
  async ({ email }: { email: string }) => {
    const certificationsUrl = getBackofficeUrl({
      path: `/responsable-certifications/certifications`,
    });
    return sendEmailUsingTemplate({
      to: { email },
      templateId: 573,
      params: {
        certificationsUrl,
      },
    });
  };
