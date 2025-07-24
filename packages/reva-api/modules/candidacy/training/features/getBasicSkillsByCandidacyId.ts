import { prismaClient } from "@/prisma/client";
export const getBasicSkillsByCandidacyId = async ({
  candidacyId,
}: {
  candidacyId: string;
}) =>
  (
    await prismaClient.candidacy
      .findUnique({ where: { id: candidacyId } })
      .basicSkills({ include: { basicSkill: true } })
  )?.map((b) => b.basicSkill) || [];
