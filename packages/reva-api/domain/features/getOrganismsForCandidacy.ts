import { Either, EitherAsync } from "purify-ts";

import { Candidacy, Organism } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface GetActiveOrganismsForCandidacyWithNewTypologiesDeps {
  getCandidacyFromId: (
    candidacyId: string
  ) => Promise<Either<string, Candidacy>>;
  getActiveOrganismForCertificationAndDepartment: (params: {
    offset?: number;
    limit?: number;
    certificationId: string;
    departmentId: string;
  }) => Promise<Either<string, Organism[]>>;
  getActiveOrganismForCertificationAndDepartmentCount: (params: {
    certificationId: string;
    departmentId: string;
  }) => Promise<Either<string, number>>;
}

export const getActiveOrganismsForCandidacyWithNewTypologies =
  ({
    getActiveOrganismForCertificationAndDepartment,
    getCandidacyFromId,
    getActiveOrganismForCertificationAndDepartmentCount,
  }: GetActiveOrganismsForCandidacyWithNewTypologiesDeps) =>
    (params: { candidacyId: string; offset?: number; limit?: number }) => {
      const isPaginatedMode = params.offset || params.limit;
    return EitherAsync.fromPromise(() => getCandidacyFromId(params.candidacyId))
      .chain(async (candidacy) => {
        const rows = await getActiveOrganismForCertificationAndDepartment({
          certificationId: candidacy.certificationId || "",
          departmentId: candidacy.department?.id || "",
          offset: params.offset,
          limit: params.limit,
        });
        return isPaginatedMode
          ? {
            rows,
            info: {
              totalRows: number;
              currentPage: number;
              totalPages: number;
              pageLength: number;
            }
          }
          : rows;
      })
      .mapLeft(
        () =>
          new FunctionalError(
            FunctionalCodeError.AAP_ORGANISMS_NOT_FOUND,
            `Erreur lors de la récupération des organismes AAP de la candidature`
          )
      );
  };

export const getActiveOrganismsForCandidacyWithNewTypologiesCount =
  ({
    getActiveOrganismForCertificationAndDepartmentCount,
    getCandidacyFromId,
  }: GetActiveOrganismsForCandidacyWithNewTypologiesDeps) =>
  ({ candidacyId }: { candidacyId: string }) => {
    return EitherAsync.fromPromise(() => getCandidacyFromId(candidacyId))
      .chain((candidacy) =>
        getActiveOrganismForCertificationAndDepartmentCount({
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
