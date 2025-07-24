import { getCandidateAppUrl } from "../../candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "../../shared/email";
import { UploadedFile } from "../../shared/file";

export const sendJuryScheduledCandidateEmail = async ({
  email,
  convocationFile,
}: {
  email: string;
  convocationFile?: UploadedFile;
}) => {
  const attachment = convocationFile
    ? [
        {
          name: convocationFile.filename,
          content: convocationFile._buf.toString("base64"),
        },
      ]
    : undefined;

  return sendEmailUsingTemplate({
    to: { email },
    templateId: 523,
    params: {
      candidateAppUrl: getCandidateAppUrl(),
      convocationFilePresent: !!convocationFile,
    },
    attachment,
  });
};
