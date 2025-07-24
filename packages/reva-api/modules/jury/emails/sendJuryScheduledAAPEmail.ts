import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
} from "@/modules/shared/email";

export const sendJuryScheduledAAPEmail = async ({
  candidacyId,
  email,
  candidateFullName,
}: {
  candidacyId: string;
  email: string;
  candidateFullName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 541,
    params: {
      candidateFullName,
      juryUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/jury-aap`,
      }),
    },
  });
};
