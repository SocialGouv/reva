import { prismaClient } from "../../../prisma/client";

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

export const getLLToEarthFromZip = async ({ zip }: { zip?: string | null }) => {
  if (!zip) {
    return null;
  }

  const query = `https://data.geopf.fr/geocodage/search?type=municipality&q=${zip}&limit=1`;
  const res = await fetch(query);

  const { features }: SearchResponse = await res.json();

  if (!features?.length) {
    return null;
  }

  const [
    {
      geometry: { coordinates },
    },
  ] = features;
  const [longitude, latitude] = coordinates;

  const [{ ll_to_earth }]: { ll_to_earth: string }[] =
    await prismaClient.$queryRaw`SELECT CAST(ll_to_earth(${latitude}, ${longitude}) AS TEXT)`;
  return ll_to_earth;
};
