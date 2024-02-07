import { prismaClient } from "../../../prisma/client";

export const getDegreeByLevel = ({ level }: { level: number }) =>
  prismaClient.degree.findFirst({ where: { level } });
