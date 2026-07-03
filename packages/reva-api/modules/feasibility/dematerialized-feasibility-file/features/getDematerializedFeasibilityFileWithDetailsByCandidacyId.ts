import { prismaClient } from "@/prisma/client";

import { createDFFIfNotExistsByCandidacyId } from "./createDefaultDFF";

export const getDematerializedFeasibilityFileWithDetailsByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) => {
  const dff = await prismaClient.dematerializedFeasibilityFile.findFirst({
    where: { feasibility: { candidacyId, isActive: true } },
    include: {
      feasibility: {
        include: {
          candidacy: {
            include: {
              certification: {
                select: {
                  label: true,
                  certificationAuthorityStructure: {
                    select: {
                      label: true,
                    },
                  },
                },
              },
              organism: {
                select: {
                  emailContact: true,
                  contactAdministrativeEmail: true,
                },
              },
              candidate: {
                select: {
                  email: true,
                  street: true,
                  city: true,
                  zip: true,
                  addressComplement: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const isDfDematAutonomeActive = await prismaClient.feature.findFirst({
    where: { key: "DF_DEMAT_AUTONOME", isActive: true },
  });

  if (isDfDematAutonomeActive && !dff) {
    await createDFFIfNotExistsByCandidacyId({ candidacyId });

    return prismaClient.dematerializedFeasibilityFile.findFirst({
      where: { feasibility: { candidacyId, isActive: true } },
      include: {
        feasibility: {
          include: {
            candidacy: {
              include: {
                certification: {
                  select: {
                    label: true,
                    certificationAuthorityStructure: {
                      select: {
                        label: true,
                      },
                    },
                  },
                },
                organism: {
                  select: {
                    emailContact: true,
                    contactAdministrativeEmail: true,
                  },
                },
                candidate: {
                  select: {
                    email: true,
                    street: true,
                    city: true,
                    zip: true,
                    addressComplement: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  return dff;
};
