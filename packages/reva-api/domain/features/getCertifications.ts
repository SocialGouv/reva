import { Either, EitherAsync, Left } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
import { Certification } from "../types/search";

interface GetCertificationsDependencies {
  getCertifications: (params: {departmentId: string}) => Promise<Either<string, Certification[]>>;
}

export const getCertifications =
  (deps: GetCertificationsDependencies) =>
    async (params: {departmentId: string}) => EitherAsync.fromPromise(() => deps.getCertifications(params))
        .mapLeft(() => new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, 'Erreur lors de la récupération des certifications'));
