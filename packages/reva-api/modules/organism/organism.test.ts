import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import {
  attachCollaborateurAccountToMaisonMereAAP,
  createMaisonMereAapHelper,
} from "@/test/helpers/entities/create-maison-mere-aap-helper";
import {
  attachCollaborateurAccountToOrganism,
  createOrganismHelper,
} from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const maisonMereAAPComptesCollaborateursQuery = graphql(`
  query maisonMereAAPComptesCollaborateurs($maisonMereAAPId: ID!) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      comptesCollaborateurs {
        id
      }
    }
  }
`);

const compteCollaborateurByIdQuery = graphql(`
  query compteCollaborateurById($maisonMereAAPId: ID!, $accountId: ID!) {
    organism_getCompteCollaborateurById(
      maisonMereAAPId: $maisonMereAAPId
      accountId: $accountId
    ) {
      id
      firstname
      lastname
      email
    }
  }
`);

const paginatedOrganismsQuery = graphql(`
  query paginatedOrganisms(
    $maisonMereAAPId: ID!
    $offset: Int
    $limit: Int
    $searchFilter: String
    $collaborateurAccountIdFilter: ID
  ) {
    organism_getMaisonMereAAPById(maisonMereAAPId: $maisonMereAAPId) {
      paginatedOrganisms(
        offset: $offset
        limit: $limit
        searchFilter: $searchFilter
        collaborateurAccountIdFilter: $collaborateurAccountIdFilter
      ) {
        rows {
          id
        }
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

      const comptesCollaborateurs = await graphqlClient.request(
        maisonMereAAPComptesCollaborateursQuery,
        {
          maisonMereAAPId: maisonMereAAP.id,
        },
      );

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
        graphqlClient.request(maisonMereAAPComptesCollaborateursQuery, {
          maisonMereAAPId: otherMaisonMereAAP.id,
        }),
      ).rejects.toThrowError(
        "Vous n'êtes pas autorisé à accéder à cette maison mère",
      );
    });

    it("should return the compte collaborateur by id", async () => {
      const collaborateurAccount = await createAccountHelper();
      const maisonMereAAP = await createMaisonMereAapHelper();

      attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: maisonMereAAP.id,
        collaborateurAccountId: collaborateurAccount.id,
      });

      const aapKeycloakId = maisonMereAAP.gestionnaire.keycloakId;

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: authorizationHeaderForUser({
            role: "gestion_maison_mere_aap",
            keycloakId: aapKeycloakId,
          }),
        },
      });

      const comptesCollaborateurs = await graphqlClient.request(
        compteCollaborateurByIdQuery,
        {
          maisonMereAAPId: maisonMereAAP.id,
          accountId: collaborateurAccount.id,
        },
      );

      expect(comptesCollaborateurs.organism_getCompteCollaborateurById.id).toBe(
        collaborateurAccount.id,
      );
    });

    it("should throw an error when accessing a compte collaborateur of a different maison mere", async () => {
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
        graphqlClient.request(compteCollaborateurByIdQuery, {
          maisonMereAAPId: otherMaisonMereAAP.id,
          accountId: collaborateurAccountOfOtherMaisonMere.id,
        }),
      ).rejects.toThrowError(
        "Vous n'êtes pas autorisé à accéder à cette maison mère",
      );
    });
  });

  describe("paginated organisms list", () => {
    it("should return the paginated organisms list for the maisonMereAAP", async () => {
      const maisonMereAAP = await createMaisonMereAapHelper();
      const organism1 = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      const organism2 = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });

      const otherMaisonMereAAP = await createMaisonMereAapHelper();
      await createOrganismHelper({
        maisonMereAAPId: otherMaisonMereAAP.id,
      });

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: authorizationHeaderForUser({
            role: "gestion_maison_mere_aap",
            keycloakId: maisonMereAAP.gestionnaire.keycloakId,
          }),
        },
      });

      const paginatedOrganisms = await graphqlClient.request(
        paginatedOrganismsQuery,
        {
          maisonMereAAPId: maisonMereAAP.id,
          offset: 0,
          limit: 10,
        },
      );

      expect(
        paginatedOrganisms.organism_getMaisonMereAAPById.paginatedOrganisms.rows
          .length,
      ).toBe(2);

      expect(
        paginatedOrganisms.organism_getMaisonMereAAPById.paginatedOrganisms
          .rows,
      ).toEqual(
        expect.arrayContaining([{ id: organism1.id }, { id: organism2.id }]),
      );
    });

    it("should return the paginated organisms list for the maisonMereAAP with a collaborateur account filter", async () => {
      const maisonMereAAP = await createMaisonMereAapHelper();
      const organism1 = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });

      const collaborateurAccount = await createAccountHelper();

      attachCollaborateurAccountToOrganism({
        organismId: organism1.id,
        collaborateurAccountId: collaborateurAccount.id,
      });

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: authorizationHeaderForUser({
            role: "gestion_maison_mere_aap",
            keycloakId: maisonMereAAP.gestionnaire.keycloakId,
          }),
        },
      });

      const paginatedOrganisms = await graphqlClient.request(
        paginatedOrganismsQuery,
        {
          maisonMereAAPId: maisonMereAAP.id,
          collaborateurAccountIdFilter: collaborateurAccount.id,
          offset: 0,
          limit: 10,
        },
      );

      expect(
        paginatedOrganisms.organism_getMaisonMereAAPById.paginatedOrganisms
          .rows,
      ).toEqual([{ id: organism1.id }]);
    });

    it("should return the paginated organisms list for the maisonMereAAP with a searchfilter", async () => {
      const maisonMereAAP = await createMaisonMereAapHelper();
      const organism1 = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
        label: "Test Organism",
      });
      await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
        label: "Other Organism",
      });

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: authorizationHeaderForUser({
            role: "gestion_maison_mere_aap",
            keycloakId: maisonMereAAP.gestionnaire.keycloakId,
          }),
        },
      });

      const paginatedOrganisms = await graphqlClient.request(
        paginatedOrganismsQuery,
        {
          maisonMereAAPId: maisonMereAAP.id,
          searchFilter: "Test",
          offset: 0,
          limit: 10,
        },
      );

      expect(
        paginatedOrganisms.organism_getMaisonMereAAPById.paginatedOrganisms
          .rows,
      ).toEqual([{ id: organism1.id }]);
    });
  });
});

describe("Positionnement compte collaborateur", () => {
  it("should update the positionnement of a compte collaborateur", async () => {
    const collaborateurAccount = await createAccountHelper();
    const maisonMereAAP = await createMaisonMereAapHelper();

    const organism = await createOrganismHelper({
      maisonMereAAPId: maisonMereAAP.id,
    });

    attachCollaborateurAccountToMaisonMereAAP({
      maisonMereAAPId: maisonMereAAP.id,
      collaborateurAccountId: collaborateurAccount.id,
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId: maisonMereAAP.gestionnaire.keycloakId,
        }),
      },
    });

    const updatePositionnementCollaborateurMutation = graphql(`
      mutation updatePositionnementCollaborateur(
        $maisonMereAAPId: ID!
        $positionnement: UpdatePositionnementCollaborateurInput!
      ) {
        organism_updatePositionnementCollaborateur(
          maisonMereAAPId: $maisonMereAAPId
          positionnement: $positionnement
        ) {
          id
        }
      }
    `);

    await graphqlClient.request(updatePositionnementCollaborateurMutation, {
      maisonMereAAPId: maisonMereAAP.id,
      positionnement: {
        accountId: collaborateurAccount.id,
        organismIds: [organism.id],
      },
    });

    const organismsOfAccount = await prismaClient.organismOnAccount.findMany({
      where: {
        accountId: collaborateurAccount.id,
      },
    });

    expect(organismsOfAccount.length).toBe(1);
    expect(organismsOfAccount[0].organismId).toBe(organism.id);
  });

  it("should throw an error when updating the positionnement of a compte collaborateur from another maison mere", async () => {
    const collaborateurAccount = await createAccountHelper();
    const maisonMereAAP = await createMaisonMereAapHelper();
    const otherMaisonMereAAP = await createMaisonMereAapHelper();

    const organism = await createOrganismHelper({
      maisonMereAAPId: maisonMereAAP.id,
    });

    attachCollaborateurAccountToMaisonMereAAP({
      maisonMereAAPId: maisonMereAAP.id,
      collaborateurAccountId: collaborateurAccount.id,
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId: maisonMereAAP.gestionnaire.keycloakId,
        }),
      },
    });

    const updatePositionnementCollaborateurMutation = graphql(`
      mutation updatePositionnementCollaborateur(
        $maisonMereAAPId: ID!
        $positionnement: UpdatePositionnementCollaborateurInput!
      ) {
        organism_updatePositionnementCollaborateur(
          maisonMereAAPId: $maisonMereAAPId
          positionnement: $positionnement
        ) {
          id
        }
      }
    `);

    await expect(
      graphqlClient.request(updatePositionnementCollaborateurMutation, {
        maisonMereAAPId: otherMaisonMereAAP.id,
        positionnement: {
          accountId: collaborateurAccount.id,
          organismIds: [organism.id],
        },
      }),
    ).rejects.toThrowError(
      "Vous n'êtes pas autorisé à accéder à cette maison mère",
    );
  });
});
