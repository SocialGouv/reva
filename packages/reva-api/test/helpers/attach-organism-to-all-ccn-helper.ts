import { Organism } from "@prisma/client";
import { prismaClient } from "../../prisma/client";

export async function attachOrganismToAllConventionCollectiveHelper(
  organism: Organism | null,
) {
  const ccn = await prismaClient.conventionCollective.findMany();
  for (const c of ccn) {
    await prismaClient.organismOnConventionCollective.create({
      data: {
        organismId: organism?.id || "",
        ccnId: c.id,
      },
    });
  }
}
