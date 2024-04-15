import { prismaClient } from "../../../prisma/client";

export const generateLLToEarthFromZipCodeToAAP = async () => {
  try {
    const organisms = await prismaClient.organism.findMany({
      where: {
        ll_to_earth: null,
        zip: {
          not: "",
        },
      },
    });

    for (const organism of organisms) {
      const { zip } = organism;

      const res = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=centre&postcode=${zip}&limit=1"`,
      );

      const { features } = (await res.json()) as any;
      if (!features.length) {
        console.error(`No feature found for zip code ${zip}`);
        continue;
      }
      const [
        {
          geometry: { coordinates },
        },
      ] = features;

      const [longitude, latitude] = coordinates as [number, number];

      const [{ ll_to_earth }] = (await prismaClient.$queryRawUnsafe(
        `SELECT CAST(ll_to_earth(${latitude}, ${longitude}) AS TEXT)`,
      )) as any;

      await prismaClient.organism.update({
        where: { id: organism.id },
        data: {
          ll_to_earth,
        },
      });
    }
  } catch (error) {
    console.log("error >>", error);
  }
};
