import { logCandidacyAuditEvent } from "@/modules/candidacy-log/features/logCandidacyAuditEvent";
import { getOrganismById } from "@/modules/organism/features/getOrganism";
import {
  FunctionalCodeError,
  FunctionalError,
} from "@/modules/shared/error/functionalError";
import { logger } from "@/modules/shared/logger/logger";
import { prismaClient } from "@/prisma/client";

import { updateCandidacyOrganism } from "./updateCandidacyOrganism";

export const selectOrganismForCandidacyAsAdmin = async ({
  candidacyId,
  organismId,
  userKeycloakId,
  userEmail,
  userRoles,
}: {
  candidacyId: string;
  organismId: string;
  userKeycloakId?: string;
  userEmail?: string;
  userRoles: KeyCloakUserRole[];
}) => {
  const candidacy = await prismaClient.candidacy.findFirst({
    where: { id: candidacyId },
    select: {
      financeModule: true,
    },
  });

  if (!candidacy) {
    throw new FunctionalError(
      FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
      `Aucune candidature n'a été trouvée`,
    );
  }

  if (candidacy.financeModule != "hors_plateforme") {
    throw new Error(
      "La candidature doit utiliser le module de financement 'hors plateforme'.",
    );
  }

  const organism = await getOrganismById({ organismId });
  if (!organism) {
    throw new Error("Organisme non trouvé");
  }

  try {
    const updatedCandidacy = await updateCandidacyOrganism({
      candidacyId,
      organismId,
    });

    await logCandidacyAuditEvent({
      candidacyId,
      eventType: "ORGANISM_SELECTED",
      userKeycloakId,
      userEmail,
      userRoles,
      details: { organism: { id: organism.id, label: organism.label } },
    });

    return updatedCandidacy;
  } catch (e) {
    logger.error(e);
    throw new FunctionalError(
      FunctionalCodeError.ORGANISM_NOT_UPDATED,
      `Erreur lors de la mise à jour de l'organisme`,
    );
  }
};
