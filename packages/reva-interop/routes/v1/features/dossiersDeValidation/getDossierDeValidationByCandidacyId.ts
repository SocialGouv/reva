import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getDossierDeValidationByCandidacyIdQuery = graphql(`
  query getDossierDeValidationByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      activeDossierDeValidation {
        dossierDeValidationSentAt
        decision
        dossierDeValidationFile {
          name
          mimeType
          previewUrl
        }
        dossierDeValidationOtherFiles {
          name
          mimeType
          previewUrl
        }
      }
    }
  }
`);

export const getDossierDeValidationByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(
    getDossierDeValidationByCandidacyIdQuery,
    {
      candidacyId: candidacyId,
    },
  );
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
