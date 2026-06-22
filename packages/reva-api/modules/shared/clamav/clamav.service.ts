import { logger } from "../logger/logger";

export const scanFile = async (
  file: Buffer<ArrayBufferLike>,
): Promise<{ malware: boolean; reason: string; time: number }> => {
  if (!process.env.CLAMAV_REST_URL) {
    throw new Error("Antivirus endpoint is not configured");
  }
  try {
    const response = await fetch(process.env.CLAMAV_REST_URL, {
      method: "POST",
      headers: {
        ...(process.env.CLAMAV_REST_USERNAME && process.env.CLAMAV_REST_PASSWORD
          ? {
              Authorization: `Basic ${Buffer.from(`${process.env.CLAMAV_REST_USERNAME}:${process.env.CLAMAV_REST_PASSWORD}`).toString("base64")}`,
            }
          : {}),
        "Content-Type": "application/octet-stream",
      },
      body: new Uint8Array(file),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }
    return response.json();
  } catch (error) {
    logger.error(error);
    throw new Error(
      "Une erreur est survenue lors de la vérification d'intégrité du fichier",
    );
  }
};
