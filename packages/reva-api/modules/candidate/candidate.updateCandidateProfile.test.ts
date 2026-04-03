import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const updateCandidateProfileMutation = graphql(`
  mutation candidate_updateCandidateProfile(
    $candidacyId: String!
    $candidateProfile: CandidateProfileUpdateInput!
  ) {
    candidate_updateCandidateProfile(
      candidacyId: $candidacyId
      candidateProfile: $candidateProfile
    ) {
      highestDegreeLabel
    }
  }
`);

describe("candidate profile update", () => {
  test("an aap should be able to update the candidate profile of a candidacy it owns", async () => {
    const candidacy = await createCandidacyHelper();

    if (!candidacy || !candidacy.organism) {
      throw Error("Error while creating test candidacy");
    }

    const degree = await prismaClient.degree.findFirstOrThrow();

    const client = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
          keycloakId:
            candidacy.organism.organismOnAccounts[0].account.keycloakId,
        }),
      },
    });

    const result = await client.request(updateCandidateProfileMutation, {
      candidacyId: candidacy.id,
      candidateProfile: {
        highestDegreeId: degree.id,
        highestDegreeLabel: "Licence",
      },
    });

    expect(result.candidate_updateCandidateProfile?.highestDegreeLabel).toEqual(
      "Licence",
    );
  });

  test("an aap should not be able to update the candidate profile of a candidacy it does not own", async () => {
    const candidacy = await createCandidacyHelper();
    const nonOwnerOrganism = await createOrganismHelper();

    if (!candidacy) {
      throw Error("Error while creating test candidacy");
    }

    const degree = await prismaClient.degree.findFirstOrThrow();

    const client = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
          keycloakId: nonOwnerOrganism.organismOnAccounts[0].account.keycloakId,
        }),
      },
    });

    await expect(
      client.request(updateCandidateProfileMutation, {
        candidacyId: candidacy.id,
        candidateProfile: {
          highestDegreeId: degree.id,
          highestDegreeLabel: "Licence",
        },
      }),
    ).rejects.toThrowError();
  });
});
