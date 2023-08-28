import { Either, EitherAsync } from "purify-ts";

import { Candidacy, Organism } from "../../../../domain/types/candidacy";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../../domain/types/functionalError";

interface GetActiveOrganismsForCandidacyWithNewTypologiesDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getActiveOrganismForCertificationAndDepartment: (params: {
    certificationId: string;
    departmentId: string;
  }) => Promise<Either<string, Organism[]>>;
}

export const getActiveOrganismsForCandidacyWithNewTypologies =
  ({
    getActiveOrganismForCertificationAndDepartment,
    getCandidacyFromId,
  }: GetActiveOrganismsForCandidacyWithNewTypologiesDeps) =>
  ({ candidacyId }: { candidacyId: string; searchText?: string }) => {
    return EitherAsync.fromPromise(() => getCandidacyFromId(candidacyId))
      .chain((candidacy) =>
        getActiveOrganismForCertificationAndDepartment({
          certificationId: candidacy.certificationId || "",
          departmentId: candidacy.department?.id || "",
        })
      )
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.AAP_ORGANISMS_NOT_FOUND,
            `Erreur lors de la récupération des organismes AAP de la candidature`
          )
      );
  };
