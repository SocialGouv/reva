import { PrismaClient } from "@prisma/client";

const regions = [
  {
    label: "Île-de-France",
    code: "11",
  },
  {
    label: "Centre-Val de Loire",
    code: "24",
  },
  {
    label: "Bourgogne-Franche-Comté",
    code: "27",
  },
  {
    label: "Normandie",
    code: "28",
  },
  {
    label: "Hauts-de-France",
    code: "32",
  },
  {
    label: "Grand Est",
    code: "44",
  },
  {
    label: "Pays de la Loire",
    code: "52",
  },
  {
    label: "Bretagne",
    code: "53",
  },
  {
    label: "Nouvelle-Aquitaine",
    code: "75",
  },
  {
    label: "Occitanie",
    code: "76",
  },
  {
    label: "Auvergne-Rhône-Alpes",
    code: "84",
  },
  {
    label: "Provence-Alpes-Côte d'Azur",
    code: "93",
  },
  {
    label: "Corse",
    code: "94",
  },
  {
    label: "Guadeloupe",
    code: "01",
  },
  {
    label: "Martinique",
    code: "02",
  },
  {
    label: "Guyane",
    code: "03",
  },
  {
    label: "La Réunion",
    code: "04",
  },
  {
    label: "Mayotte",
    code: "06",
  },
];

export const upsertRegions = async (prisma: PrismaClient) => {
  for (const region of regions) {
    await prisma.region.upsert({
      where: { code: region.code },
      update: {},
      create: {
        label: region.label,
        code: region.code,
      },
    });
  }
};
