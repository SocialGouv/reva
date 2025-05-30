import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { createOrganismHelper } from "../../test/helpers/entities/create-organism-helper";
import { createCohorteVaeCollectiveHelper } from "../../test/helpers/entities/create-vae-collective-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { v4 as uuidv4 } from "uuid";

const getCandidacies = async ({
  userKeycloakId,
  userRole,
  cohorteVaeCollectiveId,
}: {
  userKeycloakId: string;
  userRole: KeyCloakUserRole;
  cohorteVaeCollectiveId?: string;
}) => {
  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: userRole,
      keycloakId: userKeycloakId,
    }),
    payload: {
      arguments: { cohorteVaeCollectiveId },
      requestType: "query",
      endpoint: "getCandidacies",
      returnFields: "{ rows { id } }",
    },
  });
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
          userKeycloakId: candidacy.organism?.accounts[0].keycloakId || "",
          userRole: "manage_candidacy",
          cohorteVaeCollectiveId: cohorteVaeCollective.id,
        });

        const obj = resp.json();

        expect(obj.data.getCandidacies.rows.length).toBe(1);
      });

      it("should return an empty list of candidacies when searching with the wrong vae collective cohorte id", async () => {
        const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

        const candidacy = await createCandidacyHelper({
          candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
        });

        const resp = await getCandidacies({
          userKeycloakId: candidacy.organism?.accounts[0].keycloakId || "",
          userRole: "manage_candidacy",
          cohorteVaeCollectiveId: uuidv4(),
        });

        const obj = resp.json();

        expect(obj.data.getCandidacies.rows.length).toBe(0);
      });

      it("should return an empty list of candidacies when searching with a valid vae collective cohorte id but no candidacies is associated to the aap", async () => {
        const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

        await createCandidacyHelper({
          candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
        });

        const secondOrganism = await createOrganismHelper();

        const resp = await getCandidacies({
          userKeycloakId: secondOrganism.accounts[0].keycloakId || "",
          userRole: "manage_candidacy",
          cohorteVaeCollectiveId: cohorteVaeCollective.id,
        });

        const obj = resp.json();

        expect(obj.data.getCandidacies.rows.length).toBe(0);
      });
    });
  });
});
