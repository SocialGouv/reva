import { prismaClient } from "@/prisma/client";

export const assertNoDuplicateLieuAccueilAddress = async ({
  maisonMereAAPId,
  street,
  city,
  excludeOrganismId,
}: {
  maisonMereAAPId: string;
  street: string | null | undefined;
  city: string | null | undefined;
  excludeOrganismId?: string;
}) => {
  if (!street || !city) {
    return;
  }

  const duplicate = await prismaClient.organism.findFirst({
    where: {
      modaliteAccompagnement: "LIEU_ACCUEIL",
      maisonMereAAPId,
      adresseNumeroEtNomDeRue: { equals: street, mode: "insensitive" },
      adresseVille: { equals: city, mode: "insensitive" },
      ...(excludeOrganismId ? { id: { not: excludeOrganismId } } : {}),
    },
    select: { id: true },
  });

  if (duplicate) {
    throw new Error("Un lieu d'accueil existe déjà avec cette adresse.");
  }
};
