import { prismaClient } from "../../../prisma/client";

export const getBasicSkills = prismaClient.basicSkill.findMany();
