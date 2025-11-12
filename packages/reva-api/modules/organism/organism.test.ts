import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import {
  attachCollaborateurAccountToMaisonMereAAP,
  createMaisonMereAapHelper,
} from "@/test/helpers/entities/create-maison-mere-aap-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const request = graphql(`
  query maisonMereAAPComptesCollaborateurs($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      comptesCollaborateurs {
        id
      }
    }
  }
`);

describe("MaisonMereAAP resolvers", () => {
  describe("comptesCollaborateurs", () => {
    it("should return the comptes collaborateurs for the maisonMereAAP", async () => {
      //compte collaborateur associated to the maison mere of the aap
      const collaborateurAccount = await createAccountHelper();
      const maisonMereAAP = await createMaisonMereAapHelper();

      attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: maisonMereAAP.id,
        collaborateurAccountId: collaborateurAccount.id,
      });

      const aapKeycloakId = maisonMereAAP.gestionnaire.keycloakId;

      //other maison mere and compte collaborateur with a different gestionnaire
      const collaborateurAccountOfOtherMaisonMere = await createAccountHelper();
      const otherMaisonMereAAP = await createMaisonMereAapHelper();

      attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: otherMaisonMereAAP.id,
        collaborateurAccountId: collaborateurAccountOfOtherMaisonMere.id,
      });

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: authorizationHeaderForUser({
            role: "gestion_maison_mere_aap",
            keycloakId: aapKeycloakId,
          }),
        },
      });

      const comptesCollaborateurs = await graphqlClient.request(request, {
        maisonMereAAPId: maisonMereAAP.id,
      });

      expect(
        comptesCollaborateurs.organism_getMaisonMereAAPById
          .comptesCollaborateurs.length,
      ).toBe(1);
    });

    it("should throw an error when accessing the accounts of a different maison mere", async () => {
      //compte collaborateur associated to the maison mere of the aap
      const collaborateurAccount = await createAccountHelper();
      const maisonMereAAP = await createMaisonMereAapHelper();

      attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: maisonMereAAP.id,
        collaborateurAccountId: collaborateurAccount.id,
      });

      const aapKeycloakId = maisonMereAAP.gestionnaire.keycloakId;

      //other maison mere and compte collaborateur with a different gestionnaire
      const collaborateurAccountOfOtherMaisonMere = await createAccountHelper();
      const otherMaisonMereAAP = await createMaisonMereAapHelper();

      attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: otherMaisonMereAAP.id,
        collaborateurAccountId: collaborateurAccountOfOtherMaisonMere.id,
      });

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: authorizationHeaderForUser({
            role: "gestion_maison_mere_aap",
            keycloakId: aapKeycloakId,
          }),
        },
      });

      await expect(
        graphqlClient.request(request, {
          maisonMereAAPId: otherMaisonMereAAP.id,
        }),
      ).rejects.toThrowError(
        "Vous n'êtes pas autorisé à accéder à cette maison mère",
      );
    });
  });
});
