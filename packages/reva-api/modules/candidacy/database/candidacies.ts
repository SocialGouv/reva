import { prismaClient } from "../../../prisma/client";

export const updateOrganism = async (params: {
  candidacyId: string;
  organismId: string | null;
}) =>
  prismaClient.candidacy.update({
    where: {
      id: params.candidacyId,
    },
    data: {
      organismId: params.organismId,
    },
  });
