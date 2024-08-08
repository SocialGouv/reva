import { prismaClient } from "../../../prisma/client";
import { candidacyIncludes } from "../../candidacy/database/candidacies";

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

  const [, newCandidacy] = await prismaClient.$transaction([
    prismaClient.candidaciesOnRegionsAndCertifications.updateMany({
      data: {
        isActive: false,
      },
      where: {
        candidacyId: params.candidacyId,
        isActive: true,
      },
    }),
    prismaClient.candidacy.update({
      where: {
        id: params.candidacyId,
      },
      data: {
        department: {
          connect: {
            id: department.id,
          },
        },
        feasibilityFormat: params.feasibilityFormat,
        certificationsAndRegions: {
          create: {
            certificationId: params.certificationId,
            regionId: department.regionId,
            author: params.author,
            isActive: true,
          },
        },
      },
      include: {
        ...candidacyIncludes,
      },
    }),
  ]);

  return newCandidacy;
};
