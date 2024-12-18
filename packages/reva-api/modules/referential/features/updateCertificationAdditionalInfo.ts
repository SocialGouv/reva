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
    });

  const {
    dossierDeValidationTemplate,
    dossierDeValidationTemplateFileId,
    ...otherInfo
  } = additionalInfo;

  const uploadedDossierDeValidationTemplate = await getUploadedFile(
    dossierDeValidationTemplate,
  );

  if (uploadedDossierDeValidationTemplate._buf.length > MAX_UPLOAD_SIZE) {
    throw new Error(
      `Le fichier ${uploadedDossierDeValidationTemplate.filename} est trop volumineux (${(uploadedDossierDeValidationTemplate._buf.length / 1024 / 1024).toFixed(2)} Mo). La taille maximale autorisée est de ${MAX_UPLOAD_SIZE / 1024 / 1024} Mo.`,
    );
  }

  const filePath = `certifications/${certificationId}/dv_templates/${uuidV4()}`;

  await uploadFileToS3({
    data: uploadedDossierDeValidationTemplate._buf,
    filePath,
    mimeType: uploadedDossierDeValidationTemplate.mimetype,
    allowedFileTypes: allowFileTypeByDocumentType.dossierDeValidationTemplate,
  });

  const dossierDeValidationTemplateFile = await prismaClient.file.create({
    data: {
      path: filePath,
      mimeType: uploadedDossierDeValidationTemplate.mimetype,
      name: uploadedDossierDeValidationTemplate.filename,
    },
  });

  if (existingInfo) {
    await deleteFile(existingInfo.dossierDeValidationTemplateFileId);
    await prismaClient.file.delete({
      where: {
        id: existingInfo.dossierDeValidationTemplateFileId,
      },
    });
  }
  return prismaClient.certificationAdditionalInfo.create({
    data: {
      certificationId,
      dossierDeValidationTemplateFileId: dossierDeValidationTemplateFile.id,
      ...otherInfo,
    },
  });
};
