import { logger } from "@/modules/shared/logger/logger";

const GEO_API_BASE_URL = "https://geo.api.gouv.fr";
const TIMEOUT_MS = 5000;

interface BirthplaceResolution {
  cityName: string;
  departmentCode: string;
}

export const resolveBirthplaceFromInseeCode = async (
  inseeCode: string,
): Promise<BirthplaceResolution | null> => {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(
      `${GEO_API_BASE_URL}/communes/${inseeCode}?fields=nom,codeDepartement`,
      { signal: abortController.signal },
    );

    if (!response.ok) {
      logger.warn(
        `[France Connect] L'API Geo a retourné le statut ${response.status} pour le code INSEE "${inseeCode}"`,
      );
      return null;
    }

    const data = await response.json();

    if (!data.nom || !data.codeDepartement) {
      logger.warn(
        `[France Connect] Champs requis manquants dans la réponse de l'API Geo pour le code INSEE "${inseeCode}"`,
      );
      return null;
    }

    return {
      cityName: data.nom,
      departmentCode: data.codeDepartement,
    };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      logger.warn(
        `[France Connect] Délai d'attente dépassé pour la requête API Geo du code INSEE "${inseeCode}"`,
      );
    } else {
      logger.warn(
        `[France Connect] Échec de la résolution du lieu de naissance pour le code INSEE "${inseeCode}" : ${error instanceof Error ? error.message : error}`,
      );
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
