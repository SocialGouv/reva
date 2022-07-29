import { Either, EitherAsync, Left, Right } from "purify-ts";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface Training {
    id: string;
    label: string;
}

interface GetTrainingsDeps {
    getTrainings: () => Promise<Either<string, Training[]>>;
}

export const getTrainings = (deps: GetTrainingsDeps) => async (): Promise<Either<FunctionalError, Training[]>> => 
    EitherAsync.fromPromise(() => deps.getTrainings())
        .mapLeft(() => new FunctionalError(FunctionalCodeError.TECHNICAL_ERROR, 'Erreur lors de la récupération des accompagnants'));



// {
//     return Right([
//         {
//             id: "1",
//             label: "Titre Professionnel Assistant maternel / Garde d'enfants"
//         },
//         {
//             id: "2",
//             label: "Titre Professionnel Conducteur accompagnateur de personnes à mobilité réduite (CApmr)" 
//         } 
//     ]);
// }