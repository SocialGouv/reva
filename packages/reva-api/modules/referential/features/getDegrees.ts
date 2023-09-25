import { prismaClient } from "../../../prisma/client";
import { Degree } from "../referential.types";

export const getDegrees = (): Promise<Degree[]> =>
  prismaClient.degree.findMany();
