import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getFeasibilityHistoryByCandidacyIdQuery = graphql(`
  query getFeasibilityHistoryByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      feasibility {
        history {
          id
          decision
          decisionComment
          decisionSentAt
        }
      }
    }
  }
`);

export const getFeasibilityHistoryByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(getFeasibilityHistoryByCandidacyIdQuery, {
    candidacyId: candidacyId,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
