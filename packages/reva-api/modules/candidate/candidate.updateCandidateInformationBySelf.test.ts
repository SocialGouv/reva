import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const updateCandidateInformationBySelfMutation = graphql(`
  mutation candidate_updateCandidateInformationBySelf(
    $candidateId: String!
    $candidateInformation: CandidateUpdateInformationBySelfInput!
  ) {
    candidate_updateCandidateInformationBySelf(
      candidateId: $candidateId
      candidateInformation: $candidateInformation
    ) {
      email
      lastname
      firstname
      phone
    }
  }
`);

describe("candidate information update by self", () => {
  test("a candidate should be able to update his information", async () => {
    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.candidate) {
      throw Error("Error while creating test candidacy");
    }

    const client = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId: candidacy.candidate.keycloakId,
        }),
      },
    });

    const updatedFields = {
      email: "self-updated@example.com",
      lastname: "NewLastname",
      firstname: "NewFirstname",
      phone: "0600000001",
    };

    const result = await client.request(
      updateCandidateInformationBySelfMutation,
      {
        candidateId: candidacy.candidate.id,
        candidateInformation: updatedFields,
      },
    );

    expect(result.candidate_updateCandidateInformationBySelf).toMatchObject(
      updatedFields,
    );
  });

  test("a candidate should not be able to update another candidate information", async () => {
    const candidacy = await createCandidacyHelper();
    const otherCandidacy = await createCandidacyHelper();

    if (
      !candidacy ||
      !candidacy.candidate ||
      !otherCandidacy ||
      !otherCandidacy.candidate
    ) {
      throw Error("Error while creating test candidacies");
    }

    const client = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
          keycloakId: candidacy.candidate.keycloakId,
        }),
      },
    });

    await expect(
      client.request(updateCandidateInformationBySelfMutation, {
        candidateId: otherCandidacy.candidate.id,
        candidateInformation: {
          email: "hacker@example.com",
          lastname: "Hacker",
          firstname: "Bad",
          phone: "0600000002",
        },
      }),
    ).rejects.toThrowError();
  });
});
