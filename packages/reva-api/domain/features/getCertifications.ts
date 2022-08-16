import { Either, EitherAsync, Left } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";
import { Certification } from "../types/search";

interface GetCertificationsDependencies {
  getCertifications: () => Promise<Either<string, Certification[]>>;
}

export const getCertifications =
  (deps: GetCertificationsDependencies) =>
    async () => EitherAsync.fromPromise(() => deps.getCertifications())
        .mapLeft(() => new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, 'Erreur lors de la récupération des certifications'));
