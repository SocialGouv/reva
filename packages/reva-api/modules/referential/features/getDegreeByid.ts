import { prismaClient } from "../../../prisma/client";

export const getDegreeById = ({ degreeId }: { degreeId: string }) =>
  prismaClient.degree.findFirst({ where: { id: degreeId } });
