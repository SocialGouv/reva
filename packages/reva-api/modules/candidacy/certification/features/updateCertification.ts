import { prismaClient } from "@/prisma/client";

export const updateCertification = async (params: {
  candidacyId: string;
  certificationId: string;
  author: string;
  feasibilityFormat: "UPLOADED_PDF" | "DEMATERIALIZED";
}) => {
  return prismaClient.candidacy.update({
    where: {
      id: params.candidacyId,
    },
    data: {
      certification: { connect: { id: params.certificationId } },
      feasibilityFormat: params.feasibilityFormat,
    },
  });
};
