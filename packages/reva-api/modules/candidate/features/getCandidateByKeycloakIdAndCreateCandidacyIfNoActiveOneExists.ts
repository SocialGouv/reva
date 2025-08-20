import { createCandidacy } from "@/modules/candidacy/features/createCandidacy";
import { getFirstActiveCandidacyByCandidateId } from "@/modules/candidacy/features/getFirstActiveCandidacyByCandidateId";
import { prismaClient } from "@/prisma/client";

import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const getCandidateByKeycloakIdAndCreateCandidacyIfNoActiveOneExists =
  async ({ keycloakId }: { keycloakId: string }) => {
    const prisma = prismaClient;
    return prisma.$transaction(async (tx) => {
      const candidate = await getCandidateByKeycloakId({ keycloakId, tx });
      if (!candidate) {
        throw new Error("Candidat non trouvé");
      }

      // Row-level lock per candidate to avoid duplicate candidacies under concurrency
      await tx.$queryRaw`SELECT id FROM candidate WHERE id = ${candidate.id}::uuid FOR UPDATE`;
      const activeCandidacy = await getFirstActiveCandidacyByCandidateId({
        candidateId: candidate.id,
        tx,
      });

      if (!activeCandidacy) {
        await createCandidacy({
          candidateId: candidate.id,
          typeAccompagnement: "ACCOMPAGNE",
          tx,
        });
      }
      return candidate;
    });
  };
