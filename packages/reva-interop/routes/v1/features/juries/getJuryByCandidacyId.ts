import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getJuryByCandidacyIdQuery = graphql(`
  query getJuryByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      jury {
        dateOfSession
      }
    }
  }
`);

export const getJuryByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(getJuryByCandidacyIdQuery, {
    candidacyId: candidacyId,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
