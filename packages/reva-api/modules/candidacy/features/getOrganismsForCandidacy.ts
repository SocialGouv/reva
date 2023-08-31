import { Either, EitherAsync } from "purify-ts";

import { Organism } from "../../organism/organism.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidacy } from "../candidacy.types";

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
