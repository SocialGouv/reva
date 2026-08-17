import { NOT_AUTHORIZED_CANDIDACY_ACCESS } from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

test("a user can't modify the account information of another candidate", async () => {
  const candidate = await createCandidateHelper();
  const anotherCandidate = await createCandidateHelper();

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidate.keycloakId,
      }),
    },
  });

  const candidacy_updateContact = graphql(`
    mutation candidacy_updateContact_of_different_candidate(
      $candidateId: ID!
      $candidateData: UpdateCandidateInput!
    ) {
      candidacy_updateContact(
        candidateId: $candidateId
        candidateData: $candidateData
      ) {
        id
      }
    }
  `);

  await expect(
    graphqlClient.request(candidacy_updateContact, {
      candidateId: anotherCandidate.id,
      candidateData: { phone: "0612345678" },
    }),
  ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
});
