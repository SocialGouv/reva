import { Either, EitherAsync } from "purify-ts";

import { Candidacy } from "../types/candidacy";
import { FunctionalCodeError, FunctionalError } from "../types/functionalError";

interface CreateFundingRequestDeps {
  createFundingRequest: (params: {
    candidacyId: string;
    fundingRequest: any;
  }) => Promise<Either<string, Candidacy>>;
  hasRole: (role: string) => boolean;
  existsCandidacyWithActiveStatuses: (params: {
    candidacyId: string;
    statuses: ["PARCOURS_CONFIRME", "ABANDON"];
  }) => Promise<Either<string, boolean>>;
  updateCandidacyStatus: (params: {
    candidacyId: string;
    status: "PRISE_EN_CHARGE";
  }) => Promise<Either<string, Candidacy>>;
}

// export const createFundingRequest =
//   (deps: CreateFundingRequestDeps) =>
//   async (params: {
//     candidacyId: string;
//     fundingRequest: any;
//   }): Promise<Either<FunctionalError, Candidacy>> => {
//     const checkIfCandidacyAlreadyExists = EitherAsync.fromPromise(() =>
//       deps.createFundingRequest(params)
//     )
//       .swap()
//       .mapLeft(
//         () =>
//           new FunctionalError(
//             FunctionalCodeError.CANDIDACY_ALREADY_EXISTS,
//             `Une candidature existe déjà pour cet appareil`
//           )
//       );

//     // const createCandidacy = EitherAsync.fromPromise(() =>
//     //   deps.createCandidacy(params)
//     // ).mapLeft(
//     //   () =>
//     //     new FunctionalError(
//     //       FunctionalCodeError.CANDIDACY_NOT_CREATED,
//     //       `Erreur lors de la creation de la candidature`
//     //     )
//     // );

//     // return checkIfCandidacyAlreadyExists
//     //   .chain(() => createCandidacy)
//     //   .ifRight(async (candidacy: any) => deps.notifyTeam(candidacy.id));
//   };
