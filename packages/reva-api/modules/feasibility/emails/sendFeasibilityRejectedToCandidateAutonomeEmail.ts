import { sendEmailUsingTemplate } from "../../shared/email";
import { UploadedFile } from "../../shared/file";

export const sendFeasibilityRejectedToCandidateAutonomeEmail = async ({
  email,
  comment,
  certificationAuthorityLabel,
  certificationName,
  infoFile,
}: {
  email: string;
  comment?: string;
  certificationAuthorityLabel: string;
  certificationName: string;
  infoFile?: UploadedFile;
}) => {
  const attachment = infoFile
    ? [{ name: infoFile.filename, content: infoFile._buf.toString("base64") }]
    : undefined;

  return sendEmailUsingTemplate({
    to: { email },
    templateId: 515,
    params: {
      certificationAuthorityLabel,
      certificationName,
      comment,
    },
    attachment,
  });
};
