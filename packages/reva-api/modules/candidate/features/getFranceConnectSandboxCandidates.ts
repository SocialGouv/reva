import { Candidate } from "@prisma/client";

import { prismaClient } from "@/prisma/client";

import { FRANCE_CONNECT_SANDBOX_EMAILS } from "./franceConnectSandboxEmails.constant";

// Renvoie uniquement les comptes sandbox FranceConnect réellement présents en
// base, triés par email croissant.
export const getFranceConnectSandboxCandidates = (): Promise<Candidate[]> =>
  prismaClient.candidate.findMany({
    where: { email: { in: [...FRANCE_CONNECT_SANDBOX_EMAILS] } },
    orderBy: { email: "asc" },
  });
