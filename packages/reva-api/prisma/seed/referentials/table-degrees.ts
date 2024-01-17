import { PrismaClient } from "@prisma/client";

export async function insertDegreesIfNone(prisma: PrismaClient) {
  const degreesCount = await prisma.degree.count();

  if (degreesCount === 0) {
    await prisma.degree.createMany({
      data: [
        {
          code: "N1_SANS",
          label: "Niveau 1 : Sans qualification",
          longLabel: "Niveau 1 : Sans qualification (hors Cléa)",
          level: 1,
        },
        {
          code: "N2_CLEA",
          label: "Niveau 2 : Cléa",
          longLabel: "Niveau 2 : Cléa",
          level: 2,
        },
        {
          code: "N3_CAP_BEP",
          label: "Niveau 3 : CAP, BEP",
          longLabel: "Niveau 3 (CAP, CQP 3, MC 3, Titre professionnel 3, DE 3)",
          level: 3,
        },
        {
          code: "N4_BAC",
          label: "Niveau 4 : Baccalauréat",
          longLabel:
            "Niveau 4 (Bac pro, Brevet professionnel, CQP 4, MC 4, Titre professionnel 4, DE 4)",
          level: 4,
        },
        {
          code: "N5_BAC_2",
          label: "Niveau 5 : Bac + 2",
          longLabel:
            "Niveau 5 (BTS, DUT, DEUST, CQP 5, Titre professionnel 5, DE 5)",
          level: 5,
        },
        {
          code: "N6_BAC_3_4",
          label: "Niveau 6 : Bac + 3 et Bac + 4",
          longLabel:
            "Niveau 6 (Licence pro, Bachelor, BUT, DES, CQP 6, Titre professionnel 6, DE 6)",
          level: 6,
        },
        {
          code: "N7_BAC_5",
          label: "Niveau 7 : Bac + 5",
          longLabel: "Niveau 7 (Master, Diplôme d'ingénieur)",
          level: 7,
        },
        {
          code: "N8_BAC_8",
          label: "Niveau 8 : Bac + 8",
          longLabel: "Niveau 8 (Doctorat)",
          level: 8,
        },
      ],
    });
  }
}
