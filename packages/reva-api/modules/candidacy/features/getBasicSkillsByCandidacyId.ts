import { prismaClient } from "../../../prisma/client";
export const getBasicSkillsByCandidacyId = ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  prismaClient.basicSkill.findMany({
    where: {
      candidacies: {
        some: {
          candidacyId: candidacyId,
        },
      },
    },
  });
