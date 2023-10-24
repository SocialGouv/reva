import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidacy } from "../candidacy.types";
import { canCandidateUpdateCandidacy } from "./canCandidateUpdateCandidacy";

interface UpdateCertificationOfCandidacyDeps {
  updateCertification: (params: {
    candidacyId: string;
    certificationId: string;
    departmentId: string;
    author: string;
  }) => Promise<Either<string, Candidacy>>;
  updateOrganism: (params: {
    candidacyId: string;
    organismId: string | null;
  }) => Promise<Either<string, Candidacy>>;
  getCandidacyFromId: (id: string) => Promise<Either<string, Candidacy>>;
}

export const updateCertificationOfCandidacy =
  (deps: UpdateCertificationOfCandidacyDeps) =>
  async (params: {
    candidacyId: string;
    certificationId: string;
    departmentId: string;
  }) => {
    // TODO Check mail format
    const checkIfCandidacyExists = EitherAsync.fromPromise(() =>
      deps.getCandidacyFromId(params.candidacyId)
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CANDIDACY_DOES_NOT_EXIST,
          `Aucune candidature n'a été trouvée`
        )
    );

    const updateCertification = EitherAsync.fromPromise(() =>
      deps.updateCertification({ ...params, author: "candidate" })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.CERTIFICATION_NOT_UPDATED,
          `Erreur lors de la mise à jour de la certification`
        )
    );

    const resetOrganism = EitherAsync.fromPromise(() =>
      deps.updateOrganism({ candidacyId: params.candidacyId, organismId: null })
    ).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.ORGANISM_NOT_UPDATED,
          `Erreur lors de la mise à jour de l'organisme`
        )
    );

    if (
      !(await canCandidateUpdateCandidacy({ candidacyId: params.candidacyId }))
    ) {
      throw new Error(
        "Impossible de mettre à jour la candidature une fois le premier entretien effetué"
      );
    }

    return checkIfCandidacyExists
      .chain(() => updateCertification)
      .chain(() => resetOrganism);
  };
