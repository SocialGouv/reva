import { PrismaClient } from "@prisma/client";

export async function insertBasicSkillsIfNone(prisma: PrismaClient) {
  const basicSkillCount = await prisma.basicSkill.count();

  if (basicSkillCount === 0) {
    await prisma.basicSkill.createMany({
      data: [
        { label: "Usage et communication numérique" },
        {
          label: "Utilisation des règles de base de calcul et du raisonnement mathématique",
        },
        { label: "Communication en français" },
      ],
    });
  }
}
