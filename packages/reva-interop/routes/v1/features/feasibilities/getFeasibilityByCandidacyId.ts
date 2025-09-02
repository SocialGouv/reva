import { Client } from "@urql/core";

import { graphql } from "../../../../graphql/generated/index.js";

const getFeasibilityByCandidacyIdQuery = graphql(`
  query getFeasibilityByCandidacyIdQuery($candidacyId: ID!) {
    getCandidacyById(id: $candidacyId) {
      id
      status
      candidacyDropOut {
        createdAt
      }
      feasibility {
        decision
        feasibilityFileSentAt
        feasibilityFormat
        feasibilityUploadedPdf {
          feasibilityFile {
            name
            mimeType
            previewUrl
          }
          IDFile {
            name
            mimeType
            previewUrl
          }
          documentaryProofFile {
            name
            mimeType
            previewUrl
          }
          certificateOfAttendanceFile {
            name
            mimeType
            previewUrl
          }
        }
        dematerializedFeasibilityFile {
          dffFile {
            name
            mimeType
            previewUrl
          }
          attachments {
            id
            type
            file {
              name
              mimeType
              previewUrl
            }
          }
        }
      }
      experiences {
        title
        description
        duration
        startedAt
      }
    }
  }
`);

export const getFeasibilityByCandidacyId = async (
  graphqlClient: Client,
  candidacyId: string,
) => {
  const r = await graphqlClient.query(getFeasibilityByCandidacyIdQuery, {
    candidacyId: candidacyId,
  });
  if (r.error) {
    throw r.error;
  }
  return r.data?.getCandidacyById;
};
