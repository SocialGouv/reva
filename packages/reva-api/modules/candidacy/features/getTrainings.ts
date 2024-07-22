import { prismaClient } from "../../../prisma/client";

export const getTrainings = () => prismaClient.training.findMany();
