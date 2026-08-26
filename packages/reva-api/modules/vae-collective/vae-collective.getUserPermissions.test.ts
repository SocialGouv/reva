import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const vaeCollective_getUserPermissions = graphql(`
  query vaeCollective_getUserPermissions {
    vaeCollective_getUserPermissions
  }
`);

const requestUserPermissions = ({ role }: { role: KeyCloakUserRole }) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role,
        keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
      }),
    },
  });

  return graphqlClient.request(vaeCollective_getUserPermissions, {});
};

describe("get user permissions vae collective", () => {
  test("should return the permissions of the vae collective role mapped to the user keycloak role", async () => {
    const res = await requestUserPermissions({ role: "manage_vae_collective" });

    expect(res).toMatchObject({
      vaeCollective_getUserPermissions: [
        "CREER_COHORTE",
        "MODIFIER_COHORTE",
        "SUPPRIMER_COHORTE",
        "VOIR_LISTE_COHORTES",
        "VOIR_COHORTE",
        "VOIR_STATISTIQUES",
        "CREER_SOUS_COMPTE",
        "MODIFIER_SOUS_COMPTE",
        "SUPPRIMER_SOUS_COMPTE",
        "VOIR_LISTE_SOUS_COMPTES",
      ],
    });
  });

  test("should return an empty array when the user keycloak role is not mapped to any vae collective role", async () => {
    const res = await requestUserPermissions({ role: "candidate" });

    expect(res).toMatchObject({
      vaeCollective_getUserPermissions: [],
    });
  });
});
