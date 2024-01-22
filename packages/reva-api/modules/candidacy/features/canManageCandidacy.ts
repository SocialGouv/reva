import debug from "debug";

import { prismaClient } from "../../../prisma/client";
import { Role } from "../../account/account.types";
import { getMaisonMereAAPById } from "../../organism/features/getMaisonMereAAPById";
import { getCandidacyFromId } from "../database/candidacies";

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

  const candidacy = (await getCandidacyFromId(candidacyId))
    .mapLeft((err: string) => {
      throw err;
    })
    .extract();

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

  const candidacyOrganismId = candidacy.organism?.id;

  const accountOrganismId = account.organismId;

  const isCandidacyorganismSameAsAccountOrganism =
    candidacyOrganismId === accountOrganismId;
  log(
    "Manager and candidacy have same organismId:",
    isCandidacyorganismSameAsAccountOrganism
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

  const isMaisonMereManagingCandidacyOrganism =
    hasRole("gestion_maison_mere_aap") &&
    maisonMere.id === candidacy.organism?.maisonMereAAPId;

  log(
    "candidacy has an organism that is part of manager maison mere:",
    isMaisonMereManagingCandidacyOrganism
  );

  return isMaisonMereManagingCandidacyOrganism;
};
