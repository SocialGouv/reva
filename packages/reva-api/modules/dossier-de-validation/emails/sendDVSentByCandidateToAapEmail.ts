import { getBackofficeUrl, sendEmailUsingTemplate } from "../../shared/email";

export const sendDVSentByCandidateToAapEmail = async ({
  email,
  candidacyId,
  aapName,
  candidateName,
}: {
  email: string;
  candidacyId: string;
  aapName: string;
  candidateName: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 553,
    params: {
      backofficeUrl: getBackofficeUrl({
        path: `/candidacies/${candidacyId}/dossier-de-validation-aap`,
      }),
      aapName,
      candidateName,
    },
  });
};
