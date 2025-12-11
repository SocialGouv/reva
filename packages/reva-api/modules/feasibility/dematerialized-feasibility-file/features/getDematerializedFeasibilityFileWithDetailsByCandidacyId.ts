import { prismaClient } from "@/prisma/client";

export const getDematerializedFeasibilityFileWithDetailsByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.dematerializedFeasibilityFile.findFirst({
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
