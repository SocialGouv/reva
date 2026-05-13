import * as getKeycloakAdminModule from "@/modules/shared/auth/getKeycloakAdmin";
import { prismaClient } from "@/prisma/client";
import { attachOrganismToAllConventionCollectiveHelper } from "@/test/helpers/attach-organism-to-all-ccn-helper";
import { attachOrganismToAllDegreesHelper } from "@/test/helpers/attach-organism-to-all-degrees-helper";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createAccountHelper } from "@/test/helpers/entities/create-account-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
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

      await attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: maisonMereAAP.id,
        collaborateurAccountId: collaborateurAccount.id,
      });

      const aapKeycloakId = maisonMereAAP.gestionnaire.keycloakId;

      //other maison mere and compte collaborateur with a different gestionnaire
      const collaborateurAccountOfOtherMaisonMere = await createAccountHelper();
      const otherMaisonMereAAP = await createMaisonMereAapHelper();

      await attachCollaborateurAccountToMaisonMereAAP({
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

      await attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: maisonMereAAP.id,
        collaborateurAccountId: collaborateurAccount.id,
      });

      const aapKeycloakId = maisonMereAAP.gestionnaire.keycloakId;

      //other maison mere and compte collaborateur with a different gestionnaire
      const collaborateurAccountOfOtherMaisonMere = await createAccountHelper();
      const otherMaisonMereAAP = await createMaisonMereAapHelper();

      await attachCollaborateurAccountToMaisonMereAAP({
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

      await attachCollaborateurAccountToMaisonMereAAP({
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

      await attachCollaborateurAccountToMaisonMereAAP({
        maisonMereAAPId: maisonMereAAP.id,
        collaborateurAccountId: collaborateurAccount.id,
      });

      const aapKeycloakId = maisonMereAAP.gestionnaire.keycloakId;

      //other maison mere and compte collaborateur with a different gestionnaire
      const collaborateurAccountOfOtherMaisonMere = await createAccountHelper();
      const otherMaisonMereAAP = await createMaisonMereAapHelper();

      await attachCollaborateurAccountToMaisonMereAAP({
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

      await attachCollaborateurAccountToOrganism({
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

    await attachCollaborateurAccountToMaisonMereAAP({
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

    await attachCollaborateurAccountToMaisonMereAAP({
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

describe("Disable local account", () => {
  const disableCompteCollaborateurMutation = graphql(`
    mutation disableCompteCollaborateur(
      $maisonMereAAPId: ID!
      $accountId: ID!
    ) {
      organism_disableCompteCollaborateur(
        maisonMereAAPId: $maisonMereAAPId
        accountId: $accountId
      )
    }
  `);

  it("should disable the local account if i'm an admin", async () => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(
      () =>
        Promise.resolve({
          users: {
            findOne: () => Promise.resolve({}),
            listGroups: () => Promise.resolve([]),
            update: () => Promise.resolve({}),
          },
        }),
    );

    const collaborateurAccount = await createAccountHelper();
    const maisonMereAAP = await createMaisonMereAapHelper();

    await attachCollaborateurAccountToMaisonMereAAP({
      maisonMereAAPId: maisonMereAAP.id,
      collaborateurAccountId: collaborateurAccount.id,
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
        }),
      },
    });

    expect(collaborateurAccount.disabledAt).toBeNull();

    await graphqlClient.request(disableCompteCollaborateurMutation, {
      maisonMereAAPId: maisonMereAAP.id,
      accountId: collaborateurAccount.id,
    });

    const account = await prismaClient.account.findUnique({
      where: {
        id: collaborateurAccount.id,
      },
    });

    expect(account?.disabledAt).toBeDefined();
  });

  it("should disable the local account if i'm the gestionnaire of the maison mere aap of the local account", async () => {
    vi.spyOn(getKeycloakAdminModule, "getKeycloakAdmin").mockImplementation(
      () =>
        Promise.resolve({
          users: {
            findOne: () => Promise.resolve({}),
            listGroups: () => Promise.resolve([]),
            update: () => Promise.resolve({}),
          },
        }),
    );

    const collaborateurAccount = await createAccountHelper();
    const maisonMereAAP = await createMaisonMereAapHelper();

    await attachCollaborateurAccountToMaisonMereAAP({
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

    expect(collaborateurAccount.disabledAt).toBeNull();

    await graphqlClient.request(disableCompteCollaborateurMutation, {
      maisonMereAAPId: maisonMereAAP.id,
      accountId: collaborateurAccount.id,
    });

    const account = await prismaClient.account.findUnique({
      where: {
        id: collaborateurAccount.id,
      },
    });

    expect(account?.disabledAt).toBeDefined();
  });

  it("should throw an error if i'm not an admin and not the gestionnaire of the maison mere aap of the local account", async () => {
    const collaborateurAccount = await createAccountHelper();
    const maisonMereAAP = await createMaisonMereAapHelper();

    await attachCollaborateurAccountToMaisonMereAAP({
      maisonMereAAPId: maisonMereAAP.id,
      collaborateurAccountId: collaborateurAccount.id,
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
        }),
      },
    });

    await expect(
      graphqlClient.request(disableCompteCollaborateurMutation, {
        maisonMereAAPId: maisonMereAAP.id,
        accountId: collaborateurAccount.id,
      }),
    ).rejects.toThrowError("You are not authorized!");
  });

  it("should throw an error if the maisonMereAAPId is not the one of the collaborateur account", async () => {
    const collaborateurAccount = await createAccountHelper();
    const maisonMereAAP = await createMaisonMereAapHelper();
    const otherMaisonMereAAP = await createMaisonMereAapHelper();

    await attachCollaborateurAccountToMaisonMereAAP({
      maisonMereAAPId: maisonMereAAP.id,
      collaborateurAccountId: collaborateurAccount.id,
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
        }),
      },
    });
    await expect(
      graphqlClient.request(disableCompteCollaborateurMutation, {
        maisonMereAAPId: otherMaisonMereAAP.id,
        accountId: collaborateurAccount.id,
      }),
    ).rejects.toThrowError(
      "Le compte collaborateur n'est pas lié à la maison mère",
    );
  });
});
describe("Search organisms", () => {
  const searchOrganismsQuery = graphql(`
    query searchOrganisms(
      $offset: Int
      $limit: Int
      $searchText: String
      $certificationIds: [ID!]
      $disponiblePourVaeCollective: Boolean
    ) {
      organism_searchOrganisms(
        offset: $offset
        limit: $limit
        searchText: $searchText
        certificationIds: $certificationIds
        disponiblePourVaeCollective: $disponiblePourVaeCollective
      ) {
        rows {
          id
        }
      }
    }
  `);

  it("should search organisms and find one when searching for a certification available to the organism", async () => {
    const certification = await createCertificationHelper();
    const ccn = await prismaClient.conventionCollective.findFirst();
    if (!certification || !ccn) {
      throw new Error("Certification or CCN not found");
    }
    await prismaClient.certificationOnConventionCollective.create({
      data: {
        certificationId: certification.id,
        ccnId: ccn.id,
      },
    });

    const organism = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    await attachOrganismToAllDegreesHelper(organism);
    await attachOrganismToAllConventionCollectiveHelper(organism);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
        }),
      },
    });
    const resp = await graphqlClient.request(searchOrganismsQuery, {
      certificationIds: [certification.id],
    });
    expect(resp.organism_searchOrganisms.rows.length).toBe(1);
  });

  it("should search organisms and find none when searching a certification unavailable to any organism", async () => {
    const certification = await createCertificationHelper();
    const ccn = await prismaClient.conventionCollective.findFirst();
    if (!certification || !ccn) {
      throw new Error("Certification or CCN not found");
    }
    await prismaClient.certificationOnConventionCollective.create({
      data: {
        certificationId: certification.id,
        ccnId: ccn.id,
      },
    });

    await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
        }),
      },
    });
    const resp = await graphqlClient.request(searchOrganismsQuery, {
      certificationIds: [certification.id],
    });
    expect(resp.organism_searchOrganisms.rows.length).toBe(0);
  });

  it("should search organisms and find one when searching for two certifications available to the organism", async () => {
    const certification = await createCertificationHelper();
    const ccn = await prismaClient.conventionCollective.findFirst();
    if (!certification || !ccn) {
      throw new Error("Certification or CCN not found");
    }
    await prismaClient.certificationOnConventionCollective.create({
      data: {
        certificationId: certification.id,
        ccnId: ccn.id,
      },
    });

    const certification2 = await createCertificationHelper();
    const ccn2 = await prismaClient.conventionCollective.findFirst();
    if (!certification2 || !ccn2) {
      throw new Error("Certification or CCN not found");
    }
    await prismaClient.certificationOnConventionCollective.create({
      data: {
        certificationId: certification2.id,
        ccnId: ccn2.id,
      },
    });

    const organism = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    await attachOrganismToAllDegreesHelper(organism);
    await attachOrganismToAllConventionCollectiveHelper(organism);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
        }),
      },
    });
    const resp = await graphqlClient.request(searchOrganismsQuery, {
      certificationIds: [certification.id, certification2.id],
    });
    expect(resp.organism_searchOrganisms.rows.length).toBe(1);
  });

  it("should search organisms and find none when searching for one certification available to the organism and one not available", async () => {
    const certification = await createCertificationHelper();
    const ccn = await prismaClient.conventionCollective.findFirst();
    if (!certification || !ccn) {
      throw new Error("Certification or CCN not found");
    }
    await prismaClient.certificationOnConventionCollective.create({
      data: {
        certificationId: certification.id,
        ccnId: ccn.id,
      },
    });

    const certification2 = await createCertificationHelper();

    const organism = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    await attachOrganismToAllDegreesHelper(organism);
    await attachOrganismToAllConventionCollectiveHelper(organism);

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
        }),
      },
    });
    const resp = await graphqlClient.request(searchOrganismsQuery, {
      certificationIds: [certification.id, certification2.id],
    });
    expect(resp.organism_searchOrganisms.rows.length).toBe(0);
  });
});

describe("Delete lieu accueil", () => {
  const deleteLieuAccueilMutation = graphql(`
    mutation deleteLieuAccueil($maisonMereAAPId: ID!, $organismId: ID!) {
      organism_deleteLieuAccueil(
        maisonMereAAPId: $maisonMereAAPId
        organismId: $organismId
      )
    }
  `);
  it("should delete a lieu accueil as admin", async () => {
    const lieuAccueil = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
          keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
        }),
      },
    });

    await graphqlClient.request(deleteLieuAccueilMutation, {
      maisonMereAAPId: lieuAccueil.maisonMereAAP!.id,
      organismId: lieuAccueil.id,
    });

    const deletedLieuAccueil = await prismaClient.organism.findUnique({
      where: { id: lieuAccueil.id },
    });

    expect(deletedLieuAccueil).toBeNull();
  });

  it("should delete a lieu accueil as gestionnaire of the maison mere aap", async () => {
    const lieuAccueil = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId: lieuAccueil.maisonMereAAP!.gestionnaire.keycloakId,
        }),
      },
    });

    await graphqlClient.request(deleteLieuAccueilMutation, {
      maisonMereAAPId: lieuAccueil.maisonMereAAP!.id,
      organismId: lieuAccueil.id,
    });

    const deletedLieuAccueil = await prismaClient.organism.findUnique({
      where: { id: lieuAccueil.id },
    });

    expect(deletedLieuAccueil).toBeNull();
  });

  it("should throw an error when the user is neither an admin nor a gestionnaire of the maison mere aap of the lieu accueil", async () => {
    const lieuAccueil = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_candidacy",
        }),
      },
    });

    await expect(
      graphqlClient.request(deleteLieuAccueilMutation, {
        maisonMereAAPId: lieuAccueil.maisonMereAAP!.id,
        organismId: lieuAccueil.id,
      }),
    ).rejects.toThrowError("You are not authorized!");
  });

  it("should throw an error if the maisonMereAAPId in params does not match the organism's maison mere", async () => {
    const lieuAccueil = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    const lieuAccueilOfOtherMaisonMere = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId:
            lieuAccueilOfOtherMaisonMere.maisonMereAAP!.gestionnaire.keycloakId,
        }),
      },
    });

    await expect(
      graphqlClient.request(deleteLieuAccueilMutation, {
        maisonMereAAPId: lieuAccueilOfOtherMaisonMere.maisonMereAAP!.id,
        organismId: lieuAccueil.id,
      }),
    ).rejects.toThrowError("L'organisme n'appartient pas à la maison mère");
  });

  it("should throw an error when the organism is not a lieu d'accueil", async () => {
    const organism = await createOrganismHelper({
      modaliteAccompagnement: "A_DISTANCE",
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId: organism.maisonMereAAP!.gestionnaire.keycloakId,
        }),
      },
    });

    await expect(
      graphqlClient.request(deleteLieuAccueilMutation, {
        maisonMereAAPId: organism.maisonMereAAP!.id,
        organismId: organism.id,
      }),
    ).rejects.toThrowError("L'organisme n'est pas un lieu d'accueil");
  });

  it("should throw an error when the lieu accueil has candidacies", async () => {
    const lieuAccueil = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    await createCandidacyHelper({
      candidacyArgs: { organismId: lieuAccueil.id },
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
        }),
      },
    });

    await expect(
      graphqlClient.request(deleteLieuAccueilMutation, {
        maisonMereAAPId: lieuAccueil.maisonMereAAP!.id,
        organismId: lieuAccueil.id,
      }),
    ).rejects.toThrowError(
      "Impossible de supprimer le lieu d'accueil car il a des candidatures",
    );
  });

  it("should add a LIEU_ACCUEIL_DELETED log entry when deleting a lieu d'accueil", async () => {
    const lieuAccueil = await createOrganismHelper({
      modaliteAccompagnement: "LIEU_ACCUEIL",
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId: lieuAccueil.maisonMereAAP!.gestionnaire.keycloakId,
        }),
      },
    });

    await graphqlClient.request(deleteLieuAccueilMutation, {
      maisonMereAAPId: lieuAccueil.maisonMereAAP!.id,
      organismId: lieuAccueil.id,
    });

    const log = await prismaClient.aAPLog.findFirst({
      where: {
        eventType: "LIEU_ACCUEIL_DELETED",
        maisonMereAAPId: lieuAccueil.maisonMereAAP!.id,
      },
    });

    expect(log).not.toBeNull();
    expect(log?.details).toMatchObject({
      organismId: lieuAccueil.id,
      organismLabel: lieuAccueil.label,
      organismNomPublic: lieuAccueil.nomPublic,
    });
  });
});

describe("Organism hasCandidacies", () => {
  const getOrganismHasCandidaciesQuery = graphql(`
    query getOrganismHasCandidacies($id: ID!) {
      organism_getOrganism(id: $id) {
        id
        hasCandidacies
      }
    }
  `);

  it("should return false when the organism has no candidacies", async () => {
    const organism = await createOrganismHelper();

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId: organism.maisonMereAAP!.gestionnaire.keycloakId,
        }),
      },
    });

    const result = await graphqlClient.request(getOrganismHasCandidaciesQuery, {
      id: organism.id,
    });

    expect(result.organism_getOrganism?.hasCandidacies).toBe(false);
  });

  it("should return true when the organism has at least one candidacy", async () => {
    const organism = await createOrganismHelper();

    await createCandidacyHelper({
      candidacyArgs: { organismId: organism.id },
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "gestion_maison_mere_aap",
          keycloakId: organism.maisonMereAAP!.gestionnaire.keycloakId,
        }),
      },
    });

    const result = await graphqlClient.request(getOrganismHasCandidaciesQuery, {
      id: organism.id,
    });

    expect(result.organism_getOrganism?.hasCandidacies).toBe(true);
  });

  it("should return hasCandidacies for the admin", async () => {
    const maisonMereAAP = await createMaisonMereAapHelper();
    const organism = await createOrganismHelper({
      maisonMereAAPId: maisonMereAAP.id,
    });

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
        }),
      },
    });

    const result = await graphqlClient.request(getOrganismHasCandidaciesQuery, {
      id: organism.id,
    });

    expect(result.organism_getOrganism?.hasCandidacies).toBe(false);
  });

  it("should throw an error when the user has no authorized role", async () => {
    const organism = await createOrganismHelper();

    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "candidate",
        }),
      },
    });

    await expect(
      graphqlClient.request(getOrganismHasCandidaciesQuery, {
        id: organism.id,
      }),
    ).rejects.toThrowError("Utilisateur non autorisé");
  });
});
