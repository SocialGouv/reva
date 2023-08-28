import { Account } from "@prisma/client";
import debug from "debug";
import { Either, Left, Right } from "purify-ts";

import { Role } from "../../../../domain/types/account";
import { Candidacy } from "../../../../domain/types/candidacy";

const log = debug("domain:canManageCandidacy");

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
  if (deps.hasRole("admin")) {
    if (params.managerOnly) {
      log("Admins are not authorized");
      return Right(false);
    }
    log("User is admin, no further check");
    return Right(true);
  }

  if (!deps.hasRole("manage_candidacy")) {
    log("User is not manager");
    return Right(false);
  }

  let candidacy, account;
  try {
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
    return Left(err as string);
  }

  const candidacyOrganismId = candidacy.extract().organism?.id;
  const accountOrganismId = account.extract().organismId;

  const isSameOrganism = candidacyOrganismId === accountOrganismId;
  log("Manager and candidacy have same organismId:", isSameOrganism);
  return Right(isSameOrganism);
};
