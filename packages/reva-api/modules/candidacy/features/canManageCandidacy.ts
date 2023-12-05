import debug from "debug";
import { Either, Left, Right } from "purify-ts";

import { Role } from "../../account/account.types";
import { getAccountFromKeycloakId } from "../../account/database/accounts";
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
}: CanManageCandidacyParams): Promise<Either<string, boolean>> => {
  if (hasRole("admin")) {
    if (managerOnly) {
      log("Admins are not authorized");
      return Right(false);
    }
    log("User is admin, no further check");
    return Right(true);
  }

  if (!hasRole("manage_candidacy")) {
    log("User is not manager");
    return Right(false);
  }

  let candidacy, account;
  try {
    candidacy = (await getCandidacyFromId(candidacyId)).mapLeft(
      (err: string) => {
        throw err;
      }
    );
    account = (await getAccountFromKeycloakId(keycloakId)).mapLeft(
      (err: string) => {
        throw err;
      }
    );
  } catch (err) {
    log("Check failed:", err);
    return Left(err as string);
  }

  const candidacyOrganismId = candidacy.extract().organism?.id;

  const accountOrganismId = account.extract().organismId;

  const isSameOrganism = candidacyOrganismId === accountOrganismId;
  log("Manager and candidacy have same organismId:", isSameOrganism);
  return Right(isSameOrganism);
};
