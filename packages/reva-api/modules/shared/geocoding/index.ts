import { GeocodingSearchResponse } from "./geocoding.types";

export type GeocodingResult =
  | { success: true; coordinates: [number, number] }
  | { success: false; error: string };

const coordinatesCache = new Map<string, [number, number]>();

export async function fetchCoordinatesFromZipCode(
  zipCode: string,
  type: "municipality" | "street" = "municipality",
): Promise<GeocodingResult> {
  const cached = coordinatesCache.get(zipCode);
  if (cached) {
    return { success: true, coordinates: cached };
  }

  try {
    const query = `https://data.geopf.fr/geocodage/search?type=${type}&q=${zipCode}&limit=1`;
    const res = await fetch(query);

    if (!res.ok) {
      return {
        success: false,
        error:
          "Le service de géolocalisation est temporairement indisponible. Veuillez réessayer ultérieurement.",
      };
    }

    const data: GeocodingSearchResponse = await res.json();

    if (!data.features || data.features.length === 0) {
      // If municipality search failed, try with street type as fallback
      // This will help for districts or groups of municipalities
      // (eg. 44100, 60240 or 49510)
      if (type === "municipality") {
        return fetchCoordinatesFromZipCode(zipCode, "street");
      }

      return {
        success: false,
        error: `Aucune coordonnée trouvée pour le code postal ${zipCode}. Veuillez vérifier le code postal et réessayer.`,
      };
    }

    const coordinates = data.features[0].geometry.coordinates;
    coordinatesCache.set(zipCode, coordinates);

    return { success: true, coordinates };
  } catch {
    return {
      success: false,
      error:
        "Une erreur est survenue lors de la recherche. Veuillez réessayer ultérieurement.",
    };
  }
}
