import { Candidate } from "@prisma/client";
import { Either, EitherAsync, Left } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";
import { Role } from "../../account/account.types";

interface GetCandidateByEmailDeps {
  hasRole: (role: Role) => boolean;
  getCandidateByEmail: (id: string) => Promise<Either<string, Candidate>>;
}

export const getCandidateByEmail =
  (deps: GetCandidateByEmailDeps) => (params: { email: string }) => {
    if (deps.hasRole("admin") || deps.hasRole("manage_candidacy")) {
      return EitherAsync.fromPromise(() =>
        deps.getCandidateByEmail(params.email)
      ).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDATE_NOT_FOUND,
            `Aucun candidat n'a été trouvé`
          )
      );
    } else {
      return Left(
        new FunctionalError(
          FunctionalCodeError.NOT_AUTHORIZED,
          `Vous n'êtes pas autorisé à accéder à ce candidat`
        )
      );
    }
  };
