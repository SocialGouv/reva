import { prismaClient } from "../../../prisma/client";

export const getAfgsuTrainingId = async () =>
  (
    await prismaClient.training.findFirst({
      where: {
        label:
          "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)",
      },
    })
  )?.id || null;
