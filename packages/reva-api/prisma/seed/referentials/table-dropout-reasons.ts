import { PrismaClient } from "@prisma/client";

export async function insertDropOutReasonsIfNone(prisma: PrismaClient) {
  const dropOutReasonCount = await prisma.dropOutReason.count();

  // Drop out reason with value 'Financement du jury' is added by a migration
  if (dropOutReasonCount === 1) {
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
        { label: "Non réponse du candidat après 3 relances" },
        { label: "Autre" },
      ],
    });
  }
}
