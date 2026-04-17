import { getKeycloakAdmin } from "@/modules/shared/auth/getKeycloakAdmin";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { FRANCE_CONNECT_SANDBOX_EMAILS } from "./franceConnectSandboxEmails.constant";

// Supprime les comptes sandbox FranceConnect à la fois côté Keycloak (realm
// applicatif) et côté base de données. Chaque suppression est isolée dans son
// propre try/catch afin qu'un échec unitaire ne bloque pas le traitement du
// lot. Renvoie le nombre de suppressions réussies.
export const deleteFranceConnectSandboxCandidates = async ({
  emails,
}: {
  emails: string[];
}): Promise<number> => {
  // On rejette tout email hors liste blanche.
  const allowlist = new Set<string>(FRANCE_CONNECT_SANDBOX_EMAILS);
  const rejected = emails.filter((email) => !allowlist.has(email));
  if (rejected.length > 0) {
    throw new Error(
      `Email(s) hors de la liste sandbox FranceConnect autorisée: ${rejected.join(", ")}`,
    );
  }

  const realm = process.env.KEYCLOAK_APP_REALM;
  if (!realm) {
    throw new Error('"KEYCLOAK_APP_REALM" env var is missing');
  }

  const candidates = await prismaClient.candidate.findMany({
    where: { email: { in: emails } },
  });

  let successCount = 0;

  for (const candidate of candidates) {
    try {
      // Suppression Keycloak. On tolère un 404 (utilisateur déjà supprimé
      // manuellement côté Keycloak) pour ne pas bloquer la suppression DB.
      try {
        const keycloakAdmin = await getKeycloakAdmin();
        await keycloakAdmin.users.del({
          id: candidate.keycloakId,
          realm,
        });
      } catch (keycloakError: unknown) {
        const status = (
          keycloakError as { response?: { status?: number }; status?: number }
        )?.response?.status;
        const fallbackStatus = (keycloakError as { status?: number })?.status;
        if (status === 404 || fallbackStatus === 404) {
          logger.warn(
            {
              candidateId: candidate.id,
              email: candidate.email,
              keycloakId: candidate.keycloakId,
            },
            "Utilisateur Keycloak introuvable pour le compte sandbox FranceConnect, suppression DB poursuivie",
          );
        } else {
          throw keycloakError;
        }
      }

      // Suppression en base dans une transaction: on purge d'abord les
      // relations de Candidacy qui n'ont pas de onDelete: Cascade afin que le
      // delete du Candidate cascade sans erreur de contrainte.
      await prismaClient.$transaction([
        prismaClient.fundingRequestBatch.deleteMany({
          where: {
            fundingRequest: { candidacy: { candidateId: candidate.id } },
          },
        }),
        prismaClient.fundingRequestBatchUnifvae.deleteMany({
          where: {
            fundingRequest: { candidacy: { candidateId: candidate.id } },
          },
        }),
        prismaClient.fundingRequest.deleteMany({
          where: { candidacy: { candidateId: candidate.id } },
        }),
        prismaClient.fundingRequestUnifvae.deleteMany({
          where: { candidacy: { candidateId: candidate.id } },
        }),
        prismaClient.paymentRequestBatch.deleteMany({
          where: {
            paymentRequest: { candidacy: { candidateId: candidate.id } },
          },
        }),
        prismaClient.paymentRequestBatchUnifvae.deleteMany({
          where: {
            paymentRequestUnifvae: {
              candidacy: { candidateId: candidate.id },
            },
          },
        }),
        prismaClient.paymentRequest.deleteMany({
          where: { candidacy: { candidateId: candidate.id } },
        }),
        prismaClient.paymentRequestUnifvae.deleteMany({
          where: { candidacy: { candidateId: candidate.id } },
        }),
        prismaClient.candidacyCandidateInfo.deleteMany({
          where: { candidacy: { candidateId: candidate.id } },
        }),
        prismaClient.candidate.delete({ where: { id: candidate.id } }),
      ]);

      successCount += 1;
      logger.info(
        { candidateId: candidate.id, email: candidate.email },
        "Compte sandbox FranceConnect supprimé (Keycloak + base de données)",
      );
    } catch (error) {
      logger.error(
        {
          candidateId: candidate.id,
          email: candidate.email,
          err: error,
        },
        "Échec de la suppression du compte sandbox FranceConnect",
      );
    }
  }

  return successCount;
};
