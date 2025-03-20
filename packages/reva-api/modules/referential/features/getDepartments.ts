import { prismaClient } from "../../../prisma/client";

export const getDepartments = (args?: { elligibleVAE?: boolean }) =>
  prismaClient.department.findMany({
    where: { elligibleVAE: args?.elligibleVAE },
    orderBy: [{ label: "asc" }],
  });
