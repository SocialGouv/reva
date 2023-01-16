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
}

export const canManageCandidacy = async (
  deps: CanManageCandidacyDeps,
  params: CanManageCandidacyParams
): Promise<Either<string, boolean>> => {
  if (!deps.hasRole("manage_candidacy")) {
    return Right(false);
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
