import { prismaClient } from "@/prisma/client";

export const updateOrganismDisponiblePourVaeCollective = ({
  organismId,
  disponiblePourVaeCollective,
}: {
  organismId: string;
  disponiblePourVaeCollective: boolean;
}) =>
  prismaClient.organism.update({
    where: { id: organismId },
    data: { disponiblePourVaeCollective },
  });
