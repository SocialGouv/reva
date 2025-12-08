import { v4 as uuidv4 } from "uuid";

import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const getCandidacies = async ({
  userKeycloakId,
  userRole,
  cohorteVaeCollectiveId,
}: {
  userKeycloakId: string;
  userRole: KeyCloakUserRole;
  cohorteVaeCollectiveId?: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: userRole,
        keycloakId: userKeycloakId,
      }),
    },
  });

  const getCandidaciesQuery = graphql(`
    query getCandidacies($cohorteVaeCollectiveId: ID) {
      getCandidacies(cohorteVaeCollectiveId: $cohorteVaeCollectiveId) {
        rows {
          id
        }
      }
    }
  `);

  return graphqlClient.request(getCandidaciesQuery, { cohorteVaeCollectiveId });
};

describe("candidacy candidacies query", () => {
  describe("VAE collective", () => {
    describe("AAP", () => {
      it("should return a list of candidacies when searching with a valid vae collective cohorte id", async () => {
        const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

        const candidacy = await createCandidacyHelper({
          candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
        });

        const resp = await getCandidacies({
          userKeycloakId:
            candidacy.organism?.organismOnAccounts[0].account.keycloakId || "",
          userRole: "manage_candidacy",
          cohorteVaeCollectiveId: cohorteVaeCollective.id,
        });

        expect(resp.getCandidacies.rows.length).toBe(1);
      });

      it("should return an empty list of candidacies when searching with the wrong vae collective cohorte id", async () => {
        const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

        const candidacy = await createCandidacyHelper({
          candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
        });

        const resp = await getCandidacies({
          userKeycloakId:
            candidacy.organism?.organismOnAccounts[0].account.keycloakId || "",
          userRole: "manage_candidacy",
          cohorteVaeCollectiveId: uuidv4(),
        });

        expect(resp.getCandidacies.rows.length).toBe(0);
      });

      it("should return an empty list of candidacies when searching with a valid vae collective cohorte id but no candidacies is associated to the aap", async () => {
        const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

        await createCandidacyHelper({
          candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
        });

        const secondOrganism = await createOrganismHelper();

        const resp = await getCandidacies({
          userKeycloakId:
            secondOrganism.organismOnAccounts[0].account.keycloakId || "",
          userRole: "manage_candidacy",
          cohorteVaeCollectiveId: cohorteVaeCollective.id,
        });

        expect(resp.getCandidacies.rows.length).toBe(0);
      });
    });
  });
});
