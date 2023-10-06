import { prismaClient } from "../../../prisma/client";

export const getTypeDiplomeById = ({
  typeDiplomeId,
}: {
  typeDiplomeId: string;
}) =>
  prismaClient.typeDiplome.findUniqueOrThrow({ where: { id: typeDiplomeId } });
