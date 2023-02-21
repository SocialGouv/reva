import { Candidate } from "@prisma/client";
import { Either, EitherAsync, Left } from "purify-ts";

import { Role } from "../types/account";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface UpdateCandidate {
  hasRole: (role: Role) => boolean;
  updateCandidate: (
    id: string,
    candidate: Candidate
  ) => Promise<Either<string, Candidate>>;
}

export const updateCandidate =
  (deps: UpdateCandidate) => (id: string, candidate: Candidate) => {
    if (!candidate.highestDegreeId) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.CANDIDATE_NOT_SAVED,
          `Veuillez renseigner le plus haut niveau de diplôme du candidat.`
        )
      );
    }

    if (!candidate.vulnerabilityIndicatorId) {
      return Left(
        new FunctionalError(
          FunctionalCodeError.CANDIDATE_NOT_SAVED,
          `Veuillez sélectionner un indicateur de public fragile.`
        )
      );
    }

    if (deps.hasRole("admin") || deps.hasRole("manage_candidacy")) {
      return EitherAsync.fromPromise(() =>
        deps.updateCandidate(id, candidate)
      ).mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.CANDIDATE_NOT_SAVED,
            `Erreur lors de l'enregistrement du candidat ${candidate.email}`
          )
      );
    }

    return Left(
      new FunctionalError(
        FunctionalCodeError.NOT_AUTHORIZED,
        `Vous n'êtes pas autorisé à modifier ce candidat`
      )
    );
  };
