import { prismaClient } from "../../../prisma/client";
import { fetchCoordinatesFromZipCode } from "../../shared/geocoding";

export const getLLToEarthFromZip = async ({ zip }: { zip?: string | null }) => {
  if (!zip) {
    return null;
  }

  const result = await fetchCoordinatesFromZipCode(zip);

  if (!result.success) {
    return null;
  }

  const [longitude, latitude] = result.coordinates;

  const [{ ll_to_earth }]: { ll_to_earth: string }[] =
    await prismaClient.$queryRaw`SELECT CAST(ll_to_earth(${latitude}, ${longitude}) AS TEXT)`;
  return ll_to_earth;
};
