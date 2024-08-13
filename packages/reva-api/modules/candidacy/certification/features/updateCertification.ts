import { prismaClient } from "../../../../prisma/client";

export const updateCertification = async (params: {
  candidacyId: string;
  certificationId: string;
  departmentId: string;
  author: string;
  feasibilityFormat: "UPLOADED_PDF" | "DEMATERIALIZED";
}) => {
  const department = await prismaClient.department.findFirst({
    where: {
      id: params.departmentId,
    },
  });

  if (!department) {
    throw new Error(`department not found ${params.departmentId}`);
  }

  return prismaClient.candidacy.update({
    where: {
      id: params.candidacyId,
    },
    data: {
      department: {
        connect: {
          id: department.id,
        },
      },
      certification: { connect: { id: params.certificationId } },
      feasibilityFormat: params.feasibilityFormat,
    },
  });
};
