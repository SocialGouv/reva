import { prismaClient } from "../prisma/client";
import { fetchCoordinatesFromZipCode } from "../modules/shared/geocoding";

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

      const result = await fetchCoordinatesFromZipCode(adresseCodePostal);

      if (!result.success) {
        console.error(result.error);
        continue;
      }

      const [longitude, latitude] = result.coordinates;

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
