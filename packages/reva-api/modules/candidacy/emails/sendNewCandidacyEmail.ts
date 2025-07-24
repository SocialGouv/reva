import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
} from "@/modules/shared/email";

export const sendNewCandidacyEmail = async ({
  email,
  candidacyId,
}: {
  email: string;
  candidacyId: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 533,
    params: {
      backofficeUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/summary/`,
      }),
    },
  });
};
