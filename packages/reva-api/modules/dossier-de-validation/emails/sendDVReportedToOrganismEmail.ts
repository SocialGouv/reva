import { getBackofficeUrl } from "@/modules/shared/email/backoffice.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";

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
