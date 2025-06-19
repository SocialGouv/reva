import { graphql } from "../../../../graphql/generated/index.js";
import { Client } from "@urql/core";

export const getCandidacyWithFeasibilityQuery = graphql(`
  query getCandidacyWithFeasibilityQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      feasibilityFormat
    }
  }
`);

export const getCandidacyDetails = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(getCandidacyWithFeasibilityQuery, {
    candidacyId: candidacyId,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
