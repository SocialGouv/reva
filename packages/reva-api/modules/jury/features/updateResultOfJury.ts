import { prismaClient } from "../../../prisma/client";
import { JuryInfo } from "../jury.types";

interface UpdateResultOfJury {
  juryId: string;
  juryInfo: JuryInfo;
}

export const updateResultOfJury = async (params: UpdateResultOfJury) => {
  const { juryId, juryInfo } = params;

  const jury = await prismaClient.jury.findUnique({
    where: { id: juryId },
  });

  if (!jury) {
    throw new Error("Le jury n'est pas actif ou n'existe pas");
  }

  const updatedJury = await prismaClient.jury.update({
    where: {
      id: jury.id,
    },
    data: {
      result: juryInfo.result,
      isResultProvisional: juryInfo.isResultProvisional,
      informationOfResult: juryInfo.informationOfResult,
    },
  });

  return updatedJury;
};
