import { getCandidateAppUrl } from "@/modules/candidate/utils/candidate.url.helpers";
import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { UploadedFile } from "@/modules/shared/file/file.interface";

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
