import { prismaClient } from "@/prisma/client";

// Lookup insensible à la casse : aligne le comportement applicatif sur
// Keycloak (case-insensitive) pour les emails historiques en casse mixte.
export const getAccountByEmail = async (email: string) =>
  prismaClient.account.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
