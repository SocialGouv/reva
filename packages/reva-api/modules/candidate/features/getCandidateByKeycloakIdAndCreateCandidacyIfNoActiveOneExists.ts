import { createCandidacy } from "@/modules/candidacy/features/createCandidacy";
import { getFirstActiveCandidacyByCandidateId } from "@/modules/candidacy/features/getFirstActiveCandidacyByCandidateId";
import { prismaClient } from "@/prisma/client";

import { getCandidateByKeycloakId } from "./getCandidateByKeycloakId";

export const getCandidateByKeycloakIdAndCreateCandidacyIfNoActiveOneExists =
  async ({ context }: { context: GraphqlContext }) => {
    const keycloakId = context.auth.userInfo?.sub || "";
    const roles = context.auth.userInfo?.realm_access?.roles;

    const prisma = prismaClient;
    return prisma.$transaction(async (tx) => {
      const candidate = await getCandidateByKeycloakId({ keycloakId, tx });
      if (!candidate) {
        throw new Error("Candidat non trouvé");
      }

      const activeCandidacy = await getFirstActiveCandidacyByCandidateId({
        candidateId: candidate.id,
        tx,
      });

      if (!activeCandidacy) {
        if (roles?.includes("candidate")) {
          await createCandidacy({
            candidateId: candidate.id,
            typeAccompagnement: "ACCOMPAGNE",
            tx,
          });
        }
      }
      return candidate;
    });
  };
