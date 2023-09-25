import { prismaClient } from "../../../prisma/client";
import { DropOutReason } from "../referential.types";

export const getDropOutReasons = (): Promise<DropOutReason[]> =>
  prismaClient.dropOutReason.findMany();
