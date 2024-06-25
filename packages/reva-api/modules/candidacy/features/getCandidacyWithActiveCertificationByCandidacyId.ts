import { prismaClient } from "../../../prisma/client";

export const getCandidacyWithActiveCertificationByCandidacyId = async (
  candidacyId: string,
) => {
  const res = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
    include: {
      organism: true,
      certificationsAndRegions: {
        include: {
          certification: {
            include: {
              competenceBlocs: {
                include: {
                  competences: true,
                },
              },
            },
          },
        },
        where: {
          isActive: true,
        },
      },
    },
  });
  return res?.certificationsAndRegions?.[0]?.certification;
};
