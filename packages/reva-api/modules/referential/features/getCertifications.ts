import { prismaClient } from "@/prisma/client";

import { Certification } from "../referential.types";

export const getCertifications = async (
  visible?: boolean,
  filters?: {
    domaines?: string[];
    branches?: string[];
    levels?: number[];
  },
): Promise<Certification[]> => {
  // If no filters, return all certifications
  if (!filters) {
    const certifications = await prismaClient.certification.findMany({
      where: {
        visible,
        certificationOnConventionCollective: {
          none: {},
        },
      },
    });

    const mappedCertifications = certifications.map((certification) => ({
      ...certification,
      codeRncp: certification.rncpId,
    }));

    return mappedCertifications;
  }

  // If filters, return certifications filtered by filters
  const { domaines, branches, levels } = filters;

  let certifications: Certification[] = [];

  if (domaines && domaines?.length > 0) {
    const domaineCertifications =
      await prismaClient.certificationOnFormacode.findMany({
        where: {
          formacodeId: { in: domaines },
          certification: {
            visible,
            level: { in: levels },
            certificationOnConventionCollective: {
              none: {},
            },
          },
        },
        include: {
          certification: true,
        },
      });

    const mappedCertifications = domaineCertifications.reduce(
      (acc, { certification }) => {
        const isIndexed = acc.findIndex((c) => c.id == certification.id) != -1;
        if (!isIndexed) {
          return [
            ...acc,
            {
              ...certification,
              codeRncp: certification.rncpId,
            },
          ];
        }

        return acc;
      },
      [] as Certification[],
    );

    certifications = [...certifications, ...mappedCertifications];
  }

  if (branches && branches?.length > 0) {
    const brancheCertifications =
      await prismaClient.certificationOnConventionCollective.findMany({
        where: {
          ccnId: { in: branches },
          certification: {
            visible,
            level: { in: levels },
          },
        },
        include: {
          certification: true,
        },
      });

    const mappedCertifications: Certification[] = brancheCertifications.map(
      ({ certification }) => ({
        ...certification,
        codeRncp: certification.rncpId,
      }),
    );

    certifications = [...certifications, ...mappedCertifications];
  }

  return certifications;
};
