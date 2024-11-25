import { prismaClient } from "../../../prisma/client";
import { UpdateCertificationStructureAndCertificationAuthoritiesInput } from "../referential.types";

export const updateCertificationStructureAndCertificationAuthorities = async ({
  certificationId,
  certificationAuthorityStructureId,
  certificationAuthorityIds,
}: UpdateCertificationStructureAndCertificationAuthoritiesInput) =>
  prismaClient
    .$transaction([
      prismaClient.certification.update({
        where: { id: certificationId },
        data: {
          certificationAuthorityOnCertification: { deleteMany: {} },
        },
      }),
      prismaClient.certification.update({
        where: { id: certificationId },
        data: {
          certificationAuthorityOnCertification: {
            createMany: {
              data: certificationAuthorityIds.map((id) => ({
                certificationAuthorityId: id,
              })),
            },
          },
        },
      }),
      prismaClient.certification.update({
        where: { id: certificationId },
        data: {
          certificationAuthorityStructureId,
        },
      }),
    ])
    .then((r) => r[r.length - 1]);
