import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { UploadedFile } from "@/modules/shared/file/file.interface";

export const sendFeasibilityValidatedToCandidateAutonomeEmail = async ({
  email,
  comment,
  certificationName,
  certificationAuthorityLabel,
  infoFile,
}: {
  email: string;
  comment?: string;
  certificationName: string;
  certificationAuthorityLabel: string;
  infoFile?: UploadedFile;
}) => {
  const attachment = infoFile
    ? [{ name: infoFile.filename, content: infoFile._buf.toString("base64") }]
    : undefined;

  return sendEmailUsingTemplate({
    to: { email },
    templateId: 516,
    params: {
      certificationAuthorityLabel,
      certificationName,
      comment,
    },
    attachment,
  });
};
