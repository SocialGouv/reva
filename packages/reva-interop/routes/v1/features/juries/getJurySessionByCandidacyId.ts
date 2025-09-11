import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getJurySessionByCandidacyIdQuery = graphql(`
  query getJurySessionByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      jury {
        dateOfSession
        timeOfSession
        timeSpecified
        addressOfSession
        informationOfSession
      }
    }
  }
`);

export const getJurySessionByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(getJurySessionByCandidacyIdQuery, {
    candidacyId: candidacyId,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
