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
    include: { organismOnAccounts: { include: { organism: true } } },
  });

  if (!account) {
    throw new Error("Votre compte utilisateur est introuvable.");
  }

  if (!account.organismOnAccounts.length) {
    return false;
  }

  const candidacyOrganismId = candidacy.organismId;
  if (!candidacyOrganismId) {
    return false;
  }

  const accountOrganismIds = account.organismOnAccounts.map(
    (organismOnAccount) => organismOnAccount.organismId,
  );

  const isCandidacyorganismIncludedInAccountOrganism =
    accountOrganismIds.includes(candidacyOrganismId);
  log(
    "Manager and candidacy have same organismId:",
    isCandidacyorganismIncludedInAccountOrganism,
  );

  if (isCandidacyorganismIncludedInAccountOrganism) {
    return true;
  }

  //An aap can be linked to multiple organisms but they all share the same maison mere aap
  //So to get the maison mere aap id we can just get the one from the first organism
  const maisonMereAAPId =
    account.organismOnAccounts[0].organism.maisonMereAAPId;

  if (!maisonMereAAPId) {
    return false;
  }

  const maisonMere = await getMaisonMereAAPById({
    maisonMereAAPId,
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
