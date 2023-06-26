import { PrismaClient } from "@prisma/client";

export async function insertDropOutReasonsIfNone(prisma: PrismaClient) {
  const dropOutReasonCount = await prisma.dropOutReason.count();

  if (dropOutReasonCount === 0) {
    await prisma.dropOutReason.createMany({
      data: [
        { label: "Reprise d’emploi" },
        { label: "Entrée en formation" },
        { label: "Découragement" },
        { label: "Raisons personnelles(santé, famille)" },
        { label: "Changement de projet" },
        { label: "Manque de temps" },
        { label: "Pas / plus intéressé" },
        { label: "Le parcours France VAE ne répond pas à mes objectifs" },
        { label: "Rémunération non obtenue" },
        { label: "Financement non obtenu" },
        { label: "Avis architecte de parcours défavorable" },
        { label: "Report du projet à plus tard" },
        { label: "Autre" },
      ],
    });
  } else {
    await prisma.dropOutReason.updateMany({
      where: {
        label: "Le parcours REVA / VAE ne répond pas à mes objectifs",
      },
      data: { label: "Le parcours France VAE ne répond pas à mes objectifs" },
    });
  }
}
