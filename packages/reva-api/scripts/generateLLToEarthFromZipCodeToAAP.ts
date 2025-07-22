import { prismaClient } from "../prisma/client";

type SearchResponse = {
  features: [
    {
      type: string;
      geometry: {
        type: string;
        coordinates: [number, number];
      };
      properties: {
        label: string;
        score: number;
        housenumber: string;
        id: string;
        type: string;
        name: string;
        postcode: string;
        citycode: string;
        x: number;
        y: number;
        city: string;
        context: string;
        importance: number;
        street: string;
      };
    },
  ];
};

(async () => {
  try {
    const organisms = await prismaClient.organism.findMany({
      where: {
        llToEarth: null,
        OR: [
          {
            adresseCodePostal: {
              not: "",
            },
          },
        ],
      },
    });

    console.log(
      `Found ${organisms.length} organisms without llToEarth coordinates.`,
    );

    for (const organism of organisms) {
      const { adresseCodePostal } = organism;

      if (!adresseCodePostal) continue;

      // add wait time to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const res = await fetch(
        `https://data.geopf.fr/geocodage/search?type=municipality&q=${adresseCodePostal}&limit=1`,
      );

      if (!res.ok) {
        console.error(
          `Failed to fetch coordinates for zip code ${adresseCodePostal}: ${res.statusText}`,
        );
        continue;
      }

      const { features }: SearchResponse = await res.json();
      if (!features.length) {
        console.error(`No feature found for zip code ${adresseCodePostal}`);
        continue;
      }
      const [
        {
          geometry: { coordinates },
        },
      ] = features;

      const [longitude, latitude] = coordinates;

      const [{ ll_to_earth: llToEarth }]: { ll_to_earth: string }[] =
        await prismaClient.$queryRaw`SELECT CAST(ll_to_earth(${latitude}, ${longitude}) AS TEXT)`;

      await prismaClient.organism.update({
        where: { id: organism.id },
        data: {
          llToEarth,
        },
      });
    }
  } catch (error) {
    console.log("error generateLLToEarthFromZipCodeToAAP : ", error);
  }
})();
