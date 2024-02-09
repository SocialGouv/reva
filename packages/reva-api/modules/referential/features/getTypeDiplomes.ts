import { prismaClient } from "../../../prisma/client";

export const getTypeDiplomes = () => prismaClient.typeDiplome.findMany();
