import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
} from "@/modules/shared/email";

export const sendCandidacyTransferToNewCertificationAuthorityEmail = async ({
  email,
  previousCertificationAuthorityName,
  newCertificationAuthorityName,
  candidateName,
  transferReason,
  candidacyId,
}: {
  email: string;
  previousCertificationAuthorityName: string;
  newCertificationAuthorityName: string;
  candidateName: string;
  transferReason: string;
  candidacyId: string;
}) => {
  const feasibilityUrl = getBackofficeUrl({
    path: `/candidacies/${candidacyId}/feasibility`,
  });

  return sendEmailUsingTemplate({
    to: { email },
    templateId: 571,
    params: {
      feasibilityUrl,
      previousCertificationAuthorityName,
      newCertificationAuthorityName,
      candidateName,
      transferReason,
    },
  });
};
