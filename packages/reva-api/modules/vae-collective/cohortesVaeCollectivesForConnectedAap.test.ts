import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { createCohorteVaeCollectiveHelper } from "../../test/helpers/entities/create-vae-collective-helper";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { createOrganismHelper } from "../../test/helpers/entities/create-organism-helper";

const getCohortesForAap = async ({
  aapKeycloakId,
}: {
  aapKeycloakId: string;
}) => {
  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "cohortesVaeCollectivesForConnectedAap",
      returnFields: "{ id nom }",
    },
  });
};

describe("cohortes vae collectives for aap", () => {
  test("should return a cohorte when a candidacy is belonging to it and is associated to the aap", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });

    const resp = await getCohortesForAap({
      aapKeycloakId: candidacy.organism?.accounts[0].keycloakId || "",
    });

    const obj = resp.json();

    expect(obj.data.cohortesVaeCollectivesForConnectedAap.length).toBe(1);
  });

  test("should return an empty array when a candidacy is belonging to a cohorte and is NOT associated to the aap", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });

    const secondOrganism = await createOrganismHelper();

    const resp = await getCohortesForAap({
      aapKeycloakId: secondOrganism.accounts[0].keycloakId || "",
    });

    const obj = resp.json();

    expect(obj.data.cohortesVaeCollectivesForConnectedAap.length).toBe(0);
  });
});
