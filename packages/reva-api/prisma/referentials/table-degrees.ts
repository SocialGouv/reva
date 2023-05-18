import { PrismaClient } from "@prisma/client";

export async function insertDegrees(prisma: PrismaClient) {
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
          longLabel: "Niveau 3 : CAP, BEP",
          level: 3,
        },
        {
          code: "N4_BAC",
          label: "Niveau 4 : Baccalauréat",
          longLabel: "Niveau 4 : Baccalauréat",
          level: 4,
        },
        {
          code: "N5_BAC_2",
          label: "Niveau 5 : Bac + 2",
          longLabel: "Niveau 5 : Bac + 2 (DEUG, BTS, DUT, DEUST)",
          level: 5,
        },
        {
          code: "N6_BAC_3_4",
          label: "Niveau 6 : Bac + 3 et Bac + 4",
          longLabel: "Niveau 6 : Bac + 3 (Licence, Licence LMD, licence professionnelle) et Bac + 4 (Maîtrise)",
          level: 6,
        },
        {
          code: "N7_BAC_5",
          label: "Niveau 7 : Bac + 5",
          longLabel: "Niveau 7 : Bac + 5 (Master, DEA, DESS, diplôme d'ingénieur)",
          level: 7,
        },
        {
          code: "N8_BAC_8",
          label: "Niveau 8 : Bac + 8",
          longLabel: "Niveau 8 : Bac + 8 (Doctorat, habilitation à diriger des recherches)",
          level: 8,
        },
      ],
    });
  }
}
