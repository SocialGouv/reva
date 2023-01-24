import { Account } from "@prisma/client";
import debug from "debug";
import { Either, Left, Right } from "purify-ts";

import { Role } from "../types/account";
import { Candidacy } from "../types/candidacy";

const log = debug("domain");
export interface CanManageCandidacyDeps {
  hasRole: (role: Role) => boolean;
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getAccountFromKeycloakId: (
    candidacyId: string
  ) => Promise<Either<string, Account>>;
}

interface CanManageCandidacyParams {
  candidacyId: string;
  keycloakId: string;
  managerOnly?: boolean;
}

export const canManageCandidacy = async (
  deps: CanManageCandidacyDeps,
  params: CanManageCandidacyParams
): Promise<Either<string, boolean>> => {
  if(params.managerOnly) {
    if (deps.hasRole("admin")) {
      log('Admins are not authorized');
      return Right(false);
    }
  } else {
    if (deps.hasRole("admin")) {
      log('User is admin, no further check');
      return Right(true);
    }
    if (!deps.hasRole("manage_candidacy")) {
      log('User is not manager');
      return Right(false);
    }
  }
  let candidacy, account;
  try {
    log("feature canManageCandidacy");
    candidacy = (await deps.getCandidacyFromId(params.candidacyId)).mapLeft(
      (err: string) => {
        throw err;
      }
    );
    account = (await deps.getAccountFromKeycloakId(params.keycloakId)).mapLeft(
      (err: string) => {
        throw err;
      }
    );
  } catch (err) {
    log("Check failed:", err);
    return Left(`Failed canManageCandidacy check: ${err}`);
  }

  const candidacyOrganismId = candidacy.extract().organism?.id;
  const accountOrganismId = account.extract().organismId;

  const isSameOrganism = candidacyOrganismId === accountOrganismId;
  log("Check passed:", isSameOrganism);
  return Right(isSameOrganism);
};
