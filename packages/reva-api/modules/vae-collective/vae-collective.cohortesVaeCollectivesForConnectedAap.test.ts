import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const getCohortesForAap = async ({
  aapKeycloakId,
}: {
  aapKeycloakId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: aapKeycloakId,
      }),
    },
  });

  const getCohortes = graphql(`
    query cohortesVaeCollectivesForConnectedAap {
      cohortesVaeCollectivesForConnectedAap {
        id
      }
    }
  `);

  return graphqlClient.request(getCohortes);
};

describe("cohortes vae collectives for aap", () => {
  test("should return a cohorte when a candidacy is belonging to it and is associated to the aap", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });

    const resp = await getCohortesForAap({
      aapKeycloakId:
        candidacy.organism?.organismOnAccounts[0].account.keycloakId || "",
    });

    expect(resp.cohortesVaeCollectivesForConnectedAap.length).toBe(1);
  });

  test("should return an empty array when a candidacy is belonging to a cohorte and is NOT associated to the aap", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });

    const secondOrganism = await createOrganismHelper();

    const resp = await getCohortesForAap({
      aapKeycloakId:
        secondOrganism.organismOnAccounts[0].account.keycloakId || "",
    });

    expect(resp.cohortesVaeCollectivesForConnectedAap.length).toBe(0);
  });
});
