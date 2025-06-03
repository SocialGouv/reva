import {
  getBackofficeUrl,
  sendEmailUsingTemplate,
} from "../../../shared/email";

export const sendCandidacyContestationCaduciteCreatedEmailToCertificationAuthority =
  async ({
    candidateFullName,
    certificationAuthorityName,
    certificationAuthorityEmail,
  }: {
    candidateFullName: string;
    certificationAuthorityName: string;
    certificationAuthorityEmail: string;
  }) => {
    const candidaciesUrl = getBackofficeUrl({
      path: `/candidacies`,
    });
    return sendEmailUsingTemplate({
      to: { email: certificationAuthorityEmail },
      templateId: 572,
      params: {
        certificationAuthorityName,
        candidaciesUrl,
        candidateFullName,
      },
    });
  };
