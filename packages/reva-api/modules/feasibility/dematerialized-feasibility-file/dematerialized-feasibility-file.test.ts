import { graphql } from "@/modules/graphql/generated/gql";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createFeasibilityDematerializedHelper } from "@/test/helpers/entities/create-feasibility-dematerialized-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

const getDFF = async ({
  candidacyId,
  userRole,
  userKeycloakId,
}: {
  candidacyId: string;
  userRole: KeyCloakUserRole;
  userKeycloakId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: userRole,
        keycloakId: userKeycloakId,
      }),
    },
  });

  const getDFF = graphql(`
    query getDFF($candidacyId: ID!) {
      feasibility_getActiveFeasibilityByCandidacyId(candidacyId: $candidacyId) {
        id
        dematerializedFeasibilityFile {
          id
          complementExperienceParcoursVise
        }
      }
    }
  `);

  const feasibilityResponse = await graphqlClient.request(getDFF, {
    candidacyId,
  });

  return feasibilityResponse.feasibility_getActiveFeasibilityByCandidacyId
    ?.dematerializedFeasibilityFile;
};

const updateComplementExperienceParcoursVise = async ({
  candidacyId,
  complementExperienceParcoursVise,
  userRole,
  userKeycloakId,
}: {
  candidacyId: string;
  complementExperienceParcoursVise: string;
  userRole: KeyCloakUserRole;
  userKeycloakId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: userRole,
        keycloakId: userKeycloakId,
      }),
    },
  });

  const updateComplementExperienceParcoursVise = graphql(`
    mutation updateComplementExperienceParcoursVise(
      $candidacyId: ID!
      $complementExperienceParcoursVise: String!
    ) {
      dematerialized_feasibility_file_createOrUpdateComplementExperienceParcoursVise(
        candidacyId: $candidacyId
        input: {
          complementExperienceParcoursVise: $complementExperienceParcoursVise
        }
      ) {
        id
        complementExperienceParcoursVise
      }
    }
  `);

  return graphqlClient.request(updateComplementExperienceParcoursVise, {
    candidacyId,
    complementExperienceParcoursVise,
  });
};

describe("Complément d'expérience lié au parcours visé", () => {
  test("should update a feasibility file's complement experience parcours vise", async () => {
    const feasibility = await createFeasibilityDematerializedHelper();

    const resp = await updateComplementExperienceParcoursVise({
      candidacyId: feasibility.candidacyId,
      complementExperienceParcoursVise:
        "new complement experience parcours vise",
      userRole: "manage_candidacy",
      userKeycloakId:
        feasibility.candidacy.organism?.organismOnAccounts[0].account
          .keycloakId ?? "",
    });

    expect(
      resp.dematerialized_feasibility_file_createOrUpdateComplementExperienceParcoursVise,
    ).toMatchObject({
      id: feasibility.dematerializedFeasibilityFile?.id,
      complementExperienceParcoursVise:
        "new complement experience parcours vise",
    });
  });

  test("should be able to get the complement experience parcours vise for a dff", async () => {
    const feasibility = await createFeasibilityDematerializedHelper({
      dematerializedFeasibilityFile: {
        create: {
          complementExperienceParcoursVise:
            "complement experience parcours vise",
        },
      },
    });

    const resp = await getDFF({
      candidacyId: feasibility.candidacyId,
      userRole: "manage_candidacy",
      userKeycloakId:
        feasibility.candidacy.organism?.organismOnAccounts[0].account
          .keycloakId ?? "",
    });

    expect(resp).toEqual({
      id: feasibility.dematerializedFeasibilityFile?.id,
      complementExperienceParcoursVise:
        feasibility.dematerializedFeasibilityFile
          ?.complementExperienceParcoursVise,
    });
  });
});
