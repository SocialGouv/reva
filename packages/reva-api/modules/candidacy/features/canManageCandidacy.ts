import debug from "debug";

import { Role } from "../../account/account.types";
import { getAccountFromKeycloakId } from "../../account/database/accounts";
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
    return false;
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

  const account = (await getAccountFromKeycloakId(keycloakId))
    .mapLeft((err: string) => {
      throw err;
    })
    .extract();

  const maisonMere = candidacy.organism?.maisonMereAAPId
    ? await getMaisonMereAAPById({
        maisonMereAAPId: candidacy.organism?.maisonMereAAPId,
      })
    : null;

  const candidacyOrganismId = candidacy.organism?.id;

  const accountOrganismId = account.organismId;

  const isCandidacyorganismSameAsAccountOrganism =
    candidacyOrganismId === accountOrganismId;
  log(
    "Manager and candidacy have same organismId:",
    isCandidacyorganismSameAsAccountOrganism
  );

  const isCandidacyOrganismPartOfMaisonMere = !!(
    maisonMere && maisonMere?.id === candidacy?.organism?.maisonMereAAPId
  );

  log(
    "candidacy has an organism that is part of manager maison mere:",
    isCandidacyorganismSameAsAccountOrganism
  );

  return (
    isCandidacyorganismSameAsAccountOrganism ||
    isCandidacyOrganismPartOfMaisonMere
  );
};
