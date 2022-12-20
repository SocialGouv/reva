import mercurius from "mercurius";

import { takeOverCandidacy } from "../../../../domain/features/takeOverCandidacy";
import * as candidacyDb from "../../../database/postgres/candidacies";

export const dropOutCandidacy = async (
  _: unknown,
  payload: {
    candidacyId: string;
    dropOut: {
      dropOutReasonId: string;
      dropOutDate: Date;
      otherReasonContent: string | null;
    };
  },
  context
) => {
  console.log("dropout", {
    candidacyId: payload.candidacyId,
    dropOut: payload.dropOut,
  });
  // TODO : do the mutation
  // return Promise.resolve(
  //   {
  //     id: payload.candidacyId,
  //   } // new Candidacy()
  // );
  const result = await takeOverCandidacy({
    hasRole: context.auth.hasRole,
    existsCandidacyWithActiveStatus:
      candidacyDb.existsCandidacyWithActiveStatus,
    updateCandidacyStatus: candidacyDb.updateCandidacyStatus,
  })({
    candidacyId: payload.candidacyId,
  });

  return result
    .mapLeft((error) => new mercurius.ErrorWithProps(error.message, error))
    .extract();

  return null;
};
