import { prismaClient } from "../../../prisma/client";

export const getMaisonMereAAPLegalInformationDocumentFileNameUrlAndMimeType =
  async ({
    maisonMereAAPId,
    fileType,
  }: {
    maisonMereAAPId: string;
    fileType:
      | "attestationURSSAFFile"
      | "justificatifIdentiteDirigeantFile"
      | "lettreDeDelegationFile"
      | "justificatifIdentiteDelegataireFile";
  }) => {
    const docs =
      await prismaClient.maisonMereAAPLegalInformationDocuments.findUnique({
        where: { maisonMereAAPId },
        include: {
          attestationURSSAFFile: true,
          justificatifIdentiteDelegataireFile: true,
          justificatifIdentiteDirigeantFile: true,
          lettreDeDelegationFile: true,
        },
      });
    if (!docs) {
      throw new Error("Documents d'informations légales non trouvés");
    }
    let filename = "";
    let mimeType = "";
    switch (fileType) {
      case "attestationURSSAFFile":
        filename = docs.attestationURSSAFFile.name;
        mimeType = docs.attestationURSSAFFile.mimeType;
        break;
      case "justificatifIdentiteDirigeantFile":
        filename = docs.justificatifIdentiteDirigeantFile.name;
        mimeType = docs.justificatifIdentiteDirigeantFile.mimeType;
        break;
      case "lettreDeDelegationFile":
        filename = docs.lettreDeDelegationFile?.name || "";
        mimeType = docs.lettreDeDelegationFile?.mimeType || "";
        break;
      case "justificatifIdentiteDelegataireFile":
        filename = docs.justificatifIdentiteDelegataireFile?.name || "";
        mimeType = docs.justificatifIdentiteDelegataireFile?.mimeType || "";
        break;
    }

    return {
      name: filename,
      mimeType,
      url: `${process.env.BASE_URL}/api/maisonMereAAP/${maisonMereAAPId}/legal-information/${fileType}`,
    };
  };
