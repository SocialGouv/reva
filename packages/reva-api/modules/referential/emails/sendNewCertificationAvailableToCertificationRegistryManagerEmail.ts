import { getBackofficeUrl, sendEmailUsingTemplate } from "../../shared/email";

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
