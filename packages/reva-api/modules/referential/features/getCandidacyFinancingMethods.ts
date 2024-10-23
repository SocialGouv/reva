import { prismaClient } from "../../../prisma/client";

export const getCandidacyFinancingMethods = () =>
  prismaClient.candidacyFinancingMethod.findMany({ orderBy: { order: "asc" } });
