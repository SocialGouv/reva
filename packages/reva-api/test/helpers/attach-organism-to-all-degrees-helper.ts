import { Organism } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

export async function attachOrganismToAllDegreesHelper(
  organism: Organism | null,
) {
  const degrees = await prismaClient.degree.findMany();
  for (const degree of degrees) {
    await prismaClient.organismOnDegree.create({
      data: {
        degreeId: degree?.id || "",
        organismId: organism?.id || "",
      },
    });
  }
}
