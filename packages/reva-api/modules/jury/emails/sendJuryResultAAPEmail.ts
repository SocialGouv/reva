import { getBackofficeUrl, sendEmailUsingTemplate } from "../../shared/email";

export const sendJuryResultAAPEmail = async ({
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
    templateId: 542,
    params: {
      candidateFullName,
      juryUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/jury-aap`,
      }),
    },
  });
};
