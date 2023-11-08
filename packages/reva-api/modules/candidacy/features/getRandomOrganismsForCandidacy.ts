import { Either, EitherAsync } from "purify-ts";

import { Organism } from "../../organism/organism.types";
import {
  FunctionalCodeError,
  FunctionalError,
} from "../../shared/error/functionalError";
import { Candidacy, SearchOrganismFilter } from "../candidacy.types";

interface GetRandomActiveOrganismsForCandidacyWithNewTypologiesDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getRandomActiveOrganismForCertificationAndDepartment: (params: {
    certificationId: string;
    departmentId: string;
    searchText?: string;
    searchFilter: SearchOrganismFilter;
    limit: number;
  }) => Promise<Either<string, Organism[]>>;
}

export const getRandomOrganismsForCandidacyWithNewTypologies =
  ({
    getRandomActiveOrganismForCertificationAndDepartment,
    getCandidacyFromId,
  }: GetRandomActiveOrganismsForCandidacyWithNewTypologiesDeps) =>
  ({
    candidacyId,
    searchText,
    searchFilter,
    limit,
  }: {
    candidacyId: string;
    searchText?: string;
    searchFilter: SearchOrganismFilter;
    limit: number;
  }) => {
    return EitherAsync.fromPromise(() => getCandidacyFromId(candidacyId))
      .chain((candidacy) =>
        getRandomActiveOrganismForCertificationAndDepartment({
          certificationId: candidacy.certificationId || "",
          departmentId: candidacy.department?.id || "",
          searchText,
          searchFilter,
          limit,
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
