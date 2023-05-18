import { PrismaClient } from "@prisma/client";

export async function insertReorientationReasons(prisma: PrismaClient) {
  const reorientationReasonCount = await prisma.reorientationReason.count();

  if (reorientationReasonCount === 0) {
    await prisma.reorientationReason.createMany({
      data: [
        { label: "Droit commun" },
        { label: "Architecte de parcours neutre" },
        { label: "Une autre certification de l'expérimentation Reva" },
      ],
    });
  }
}
