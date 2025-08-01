import debug from "debug";

import { Role } from "@/modules/account/account.types";
import { getMaisonMereAAPById } from "@/modules/organism/features/getMaisonMereAAPById";
import { getOrganismById } from "@/modules/organism/features/getOrganism";
import { prismaClient } from "@/prisma/client";

import { getCandidacy } from "./getCandidacy";

const log = debug("domain:canManageCandidacy");

interface CanManageCandidacyParams {
  hasRole: (role: Role) => boolean;
  candidacyId: string;
  keycloakId: string;
  managerOnly?: boolean;
}

export const canManageCandidacy = async ({
  hasRole,
  candidacyId,
  keycloakId,
  managerOnly,
}: CanManageCandidacyParams): Promise<boolean> => {
  if (hasRole("admin")) {
    if (managerOnly) {
      log("Admins are not authorized");
      return false;
    }
    log("User is admin, no further check");
    return true;
  }

  if (!hasRole("manage_candidacy")) {
    log("User is not manager");
    return false;
  }

  const candidacy = await getCandidacy({ candidacyId });

  if (!candidacy) {
    throw new Error("Candidature non trouvée");
  }

  const account = await prismaClient.account.findUnique({
    where: { keycloakId },
    include: { organism: true },
  });

  if (!account) {
    throw new Error("Votre compte utilisateur est introuvable.");
  }

  if (!account.organism) {
    return false;
  }

  const candidacyOrganismId = candidacy.organismId;

  const accountOrganismId = account.organismId;

  const isCandidacyorganismSameAsAccountOrganism =
    candidacyOrganismId === accountOrganismId;
  log(
    "Manager and candidacy have same organismId:",
    isCandidacyorganismSameAsAccountOrganism,
  );

  if (isCandidacyorganismSameAsAccountOrganism) {
    return true;
  }

  if (!account.organism.maisonMereAAPId) {
    return false;
  }

  const maisonMere = await getMaisonMereAAPById({
    maisonMereAAPId: account.organism.maisonMereAAPId,
  });

  if (!maisonMere) {
    return false;
  }

  const candidacyOrganism = candidacyOrganismId
    ? await getOrganismById({
        organismId: candidacyOrganismId,
      })
    : undefined;

  const isMaisonMereManagingCandidacyOrganism =
    hasRole("gestion_maison_mere_aap") &&
    maisonMere.id === candidacyOrganism?.maisonMereAAPId;

  log(
    "candidacy has an organism that is part of manager maison mere:",
    isMaisonMereManagingCandidacyOrganism,
  );

  return isMaisonMereManagingCandidacyOrganism;
};
