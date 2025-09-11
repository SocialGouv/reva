import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getJuryResultByCandidacyIdQuery = graphql(`
  query getJuryResultByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      jury {
        result
        dateOfResult
        informationOfResult
      }
    }
  }
`);

export const getJuryResultByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(getJuryResultByCandidacyIdQuery, {
    candidacyId: candidacyId,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
