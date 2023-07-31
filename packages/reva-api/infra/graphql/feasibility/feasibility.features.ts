import { prismaClient } from "../../database/postgres/client";

export interface UploadedFile {
  data: Buffer;
  filename: string;
  mimetype: string;
}

export const getCertificationAuthority = ({
  certificationId,
  departmentId,
}: {
  certificationId: string;
  departmentId: string;
}) =>
  certificationId && departmentId
    ? prismaClient.certificationAuthority.findFirst({
        where: {
          certificationAuthorityOnDepartment: { some: { departmentId } },
          certificationAuthorityOnCertification: {
            some: { certificationId },
          },
        },
      })
    : null;

export const createFeasibility = ({
  candidacyId,
  feasibilityFile,
  otherFile,
}: {
  candidacyId: string;
  feasibilityFile: UploadedFile;
  otherFile?: UploadedFile;
}) =>
  prismaClient.feasibility.create({
    data: {
      candidacy: { connect: { id: candidacyId } },
      feasibilityFileSentAt: new Date(),
      feasibilityFile: {
        create: {
          content: feasibilityFile.data,
          mimeType: feasibilityFile.mimetype,
          name: feasibilityFile.filename,
        },
      },
      otherFile: otherFile
        ? {
            create: {
              content: otherFile.data,
              mimeType: otherFile.mimetype,
              name: otherFile.filename,
            },
          }
        : undefined,
    },
  });

export const getFeasibilityByCandidacyid = ({
  candidacyId,
}: {
  candidacyId: string;
}) => prismaClient.feasibility.findFirst({ where: { candidacyId } });

export const getFileNameAndUrl = async ({
  candidacyId,
  fileId,
}: {
  candidacyId: string;
  fileId: string;
}) => {
  if (fileId) {
    const file = await prismaClient.file.findFirst({
      where: { id: fileId },
      select: { name: true },
    });
    return {
      name: file?.name || "",
      url: file
        ? `${process.env.BASE_URL}/api/candidacy/${candidacyId}/feasibility/file/${fileId}`
        : "",
    };
  } else {
    return null;
  }
};

export const getFileWithContent = async ({ fileId }: { fileId: string }) =>
  await prismaClient.file.findFirst({
    where: { id: fileId },
  });

export const getFeasibilityCountByCategory = async ({
  keycloakId,
  hasRole,
}: {
  keycloakId: string;
  hasRole: (role: string) => boolean;
}) => {
  let count = 0;
  // admin sees all feasibilities
  if (hasRole("admin")) {
    count = await prismaClient.feasibility.count();
  }
  //only list feasibilties attached to candidacies that have both certification and department covered by the certification authority linked to the user account
  else if (hasRole("manage_feasibility")) {
    const account = await prismaClient.account.findFirst({
      where: { keycloakId },
      include: {
        certificationAuthority: {
          include: {
            certificationAuthorityOnDepartment: true,
            certificationAuthorityOnCertification: true,
          },
        },
      },
    });

    const accountDepartmentIdList =
      account?.certificationAuthority?.certificationAuthorityOnDepartment?.map(
        (c) => c.departmentId
      ) || [];

    const accountCertificationIdList =
      account?.certificationAuthority?.certificationAuthorityOnCertification?.map(
        (c) => c.certificationId
      ) || [];

    if (account && account.certificationAuthority) {
      count = await prismaClient.feasibility.count({
        where: {
          candidacy: {
            certificationsAndRegions: {
              some: {
                certificationId: { in: accountCertificationIdList },
                region: {
                  departments: {
                    some: { id: { in: accountDepartmentIdList } },
                  },
                },
              },
            },
          },
        },
      });
    }
  }

  return { ALL: count };
};
