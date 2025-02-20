import { v4 as uuidV4 } from "uuid";
import { UpdateCertificationAdditionalInfoInput } from "../referential.types";
import { prismaClient } from "../../../prisma/client";
import {
  deleteFile,
  getUploadedFile,
  uploadFileToS3,
} from "../../../modules/shared/file";
import { allowFileTypeByDocumentType } from "../../../modules/shared/file/allowFileTypes";

const MAX_UPLOAD_SIZE = 15728640; // 15Mo

export const updateCertificationAdditionalInfo = async ({
  certificationId,
  additionalInfo,
}: UpdateCertificationAdditionalInfoInput) => {
  const existingInfo =
    await prismaClient.certificationAdditionalInfo.findUnique({
      where: {
        certificationId,
      },
      include: {
        dossierDeValidationTemplate: true,
      },
    });

  const { dossierDeValidationTemplate, ...otherInfo } = additionalInfo;

  if (
    (!otherInfo.dossierDeValidationLink && !dossierDeValidationTemplate) ||
    (otherInfo.dossierDeValidationLink && dossierDeValidationTemplate)
  ) {
    throw new Error(
      "La trame du dossier de validation est requise et doit être transmise soit par PDF, soit sous forme de lien.",
    );
  }

  let dossierDeValidationTemplateId: string | undefined;
  if (dossierDeValidationTemplate) {
    dossierDeValidationTemplateId = uuidV4();

    const uploadedDossierDeValidationTemplate = await getUploadedFile(
      dossierDeValidationTemplate,
    );

    if (uploadedDossierDeValidationTemplate._buf.length > MAX_UPLOAD_SIZE) {
      throw new Error(
        `Le fichier ${uploadedDossierDeValidationTemplate.filename} est trop volumineux (${(uploadedDossierDeValidationTemplate._buf.length / 1024 / 1024).toFixed(2)} Mo). La taille maximale autorisée est de ${MAX_UPLOAD_SIZE / 1024 / 1024} Mo.`,
      );
    }

    const filePath = `certifications/${certificationId}/dv_templates/${dossierDeValidationTemplateId}`;

    await uploadFileToS3({
      data: uploadedDossierDeValidationTemplate._buf,
      filePath,
      mimeType: uploadedDossierDeValidationTemplate.mimetype,
      allowedFileTypes: allowFileTypeByDocumentType.dossierDeValidationTemplate,
    });

    await prismaClient.file.create({
      data: {
        id: dossierDeValidationTemplateId,
        path: filePath,
        mimeType: uploadedDossierDeValidationTemplate.mimetype,
        name: uploadedDossierDeValidationTemplate.filename,
      },
    });
  }

  if (existingInfo?.dossierDeValidationTemplate) {
    await deleteFile(existingInfo.dossierDeValidationTemplate.path);

    // at this point existingInfo will be cascade delete
    await prismaClient.file.delete({
      where: {
        id: existingInfo.dossierDeValidationTemplate.id,
      },
    });
  } else if (existingInfo) {
    await prismaClient.certificationAdditionalInfo.delete({
      where: { id: existingInfo.id },
    });
  }

  return prismaClient.certificationAdditionalInfo.create({
    data: {
      certificationId,
      dossierDeValidationTemplateFileId: dossierDeValidationTemplateId,
      ...otherInfo,
    },
  });
};
