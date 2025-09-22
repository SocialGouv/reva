import { sendEmailUsingTemplate } from "@/modules/shared/email/sendEmailUsingTemplate";
import { UploadedFile } from "@/modules/shared/file/file.interface";

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
