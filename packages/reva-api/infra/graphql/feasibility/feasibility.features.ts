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
