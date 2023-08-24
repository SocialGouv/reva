import { PrismaClient } from "@prisma/client";

export async function insertReorientationReasonsIfNone(prisma: PrismaClient) {
  const reorientationReasonCount = await prisma.reorientationReason.count();

  if (reorientationReasonCount === 0) {
    await prisma.reorientationReason.createMany({
      data: [
        { label: "Droit commun" },
        { label: "Architecte de parcours neutre", deletedAt: new Date() },
        { label: "Une autre certification de France VAE" },
      ],
    });
  } else {
    await prisma.reorientationReason.updateMany({
      where: {
        label: "Une autre certification de l'expérimentation Reva",
      },
      data: { label: "Une autre certification de France VAE" },
    });

    await prisma.reorientationReason.update({
      where: { label: "Architecte de parcours neutre" },
      data: { deletedAt: new Date() },
    });
  }
}
