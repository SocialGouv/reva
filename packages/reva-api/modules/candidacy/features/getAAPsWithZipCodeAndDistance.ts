import { prismaClient } from "../../../prisma/client";

export const getAAPsWithZipCodeAndDistance = async ({
  distance,
  zip,
  city,
  limit,
  searchText,
}: {
  city?: string;
  zip?: string;
  distance: number;
  searchText?: string;
  limit: number;
}) => {
  const query = `https://api-adresse.data.gouv.fr/search/?q=${city ?? "centre"}${zip ? `&postcode=${zip}` : ""}&limit=1`;
  const res = (await fetch(query)) as any;
  const { features } = await res.json();

  if (!features.length) {
    console.error(`No feature found for zip code 75000`);
    return;
  }

  const [
    {
      geometry: { coordinates },
    },
  ] = features;
  const [longitude, latitude] = coordinates as [number, number];

  const organisms = await prismaClient.$queryRawUnsafe(`
    select * from organism o
    WHERE (earth_distance(ll_to_earth(${latitude},${longitude}), o.ll_to_earth::earth) / 1000) < ${distance}
    ${searchText ? `AND o.label ILIKE '%${searchText}%'` : ""}
    ORDER BY (earth_distance(ll_to_earth(${latitude},${longitude}), o.ll_to_earth::earth) / 1000) ASC
    limit ${limit}
    `);

  return organisms;
};
