import { GeocodingSearchResponse } from "./geocoding.types";

export type GeocodingResult =
  | { success: true; coordinates: [number, number] }
  | { success: false; error: string };

const coordinatesCache = new Map<string, [number, number]>();

export async function fetchCoordinatesFromZipCode(
  zipCode: string,
): Promise<GeocodingResult> {
  const cached = coordinatesCache.get(zipCode);
  if (cached) {
    return { success: true, coordinates: cached };
  }

  try {
    const query = `https://data.geopf.fr/geocodage/search?type=municipality&q=${zipCode}&limit=1`;
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
