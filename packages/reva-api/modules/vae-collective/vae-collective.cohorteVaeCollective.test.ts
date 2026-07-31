import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const cohorteVaeCollectiveQuery = graphql(`
  query cohorteVaeCollectiveByCodeInscription($codeInscription: String!) {
    cohorteVaeCollective(codeInscription: $codeInscription) {
      id
      nom
    }
  }
`);

describe("get cohorte vae collective by code inscription", () => {
  test("should let an unauthenticated caller get a cohorte vae collective by its code inscription", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      codeInscription: "ABCD1234",
    });

    const graphqlClient = getGraphQLClient({});

    const res = await graphqlClient.request(cohorteVaeCollectiveQuery, {
      codeInscription: "ABCD1234",
    });

    expect(res).toMatchObject({
      cohorteVaeCollective: {
        id: cohorteVaeCollective.id,
        nom: cohorteVaeCollective.nom,
      },
    });
  });

  test("should be case insensitive on the code inscription", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      codeInscription: "EFGH5678",
    });

    const graphqlClient = getGraphQLClient({});

    const res = await graphqlClient.request(cohorteVaeCollectiveQuery, {
      codeInscription: "efgh5678",
    });

    expect(res).toMatchObject({
      cohorteVaeCollective: {
        id: cohorteVaeCollective.id,
      },
    });
  });

  test("should return null when no cohorte matches the code inscription", async () => {
    const graphqlClient = getGraphQLClient({});

    const res = await graphqlClient.request(cohorteVaeCollectiveQuery, {
      codeInscription: "DOESNOTEXIST",
    });

    expect(res).toMatchObject({
      cohorteVaeCollective: null,
    });
  });
});
