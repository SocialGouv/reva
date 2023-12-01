import { prismaClient } from "../../../prisma/client";

export const updateFermePourAbsenceOuConges = ({
  organismId,
  fermePourAbsenceOuConges,
}: {
  organismId: string;
  fermePourAbsenceOuConges: boolean;
}) =>
  prismaClient.organism.update({
    where: { id: organismId },
    data: { fermePourAbsenceOuConges },
  });
