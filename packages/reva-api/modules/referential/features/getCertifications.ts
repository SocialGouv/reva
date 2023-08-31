import { Either, EitherAsync } from "purify-ts";

import {
  FunctionalCodeError,
  FunctionalError,
} from "../../../domain/types/functionalError";
import { Certification } from "../referential.types";

interface GetCertificationsDependencies {
  getCertifications: (params: {
    offset?: number;
    limit?: number;
    departmentId: string;
    searchText?: string;
  }) => Promise<Either<string, PaginatedListResult<Certification>>>;
}

export const getCertifications =
  (deps: GetCertificationsDependencies) =>
  async (params: {
    offset?: number;
    limit?: number;
    departmentId: string;
    searchText?: string;
  }) =>
    EitherAsync.fromPromise(() => deps.getCertifications(params)).mapLeft(
      () =>
        new FunctionalError(
          FunctionalCodeError.TECHNICAL_ERROR,
          "Erreur lors de la récupération des certifications"
        )
    );
