import { getBackofficeUrl, sendEmailUsingTemplate } from "../../shared/email";

export const sendDVReportedToOrganismEmail = async ({
  email,
  candadicyId,
  decisionComment,
}: {
  email: string;
  candadicyId: string;
  decisionComment: string;
}) => {
  return sendEmailUsingTemplate({
    to: { email },
    templateId: 537,
    params: {
      dossierValidationAapUrl: getBackofficeUrl({
        path: `/candidacies/${candadicyId}/dossier-de-validation-aap`,
      }),
      decisionComment,
    },
  });
};
