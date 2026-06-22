import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getDossierDeValidationHistoryByCandidacyIdQuery = graphql(`
  query getDossierDeValidationHistoryByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      activeDossierDeValidation {
        decision
        decisionComment
        decisionSentAt
      }
      historyDossierDeValidation {
        decision
        decisionComment
        decisionSentAt
      }
    }
  }
`);

export const getDossierDeValidationHistoryByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(
    getDossierDeValidationHistoryByCandidacyIdQuery,
    {
      candidacyId: candidacyId,
    },
  );
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
