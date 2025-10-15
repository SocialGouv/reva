import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createMaisonMereAapHelper } from "@/test/helpers/entities/create-maison-mere-aap-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const updateOnSiteInformationsMutation = graphql(`
  mutation createOrUpdateOnSiteOrganismGeneralInformation(
    $organismId: ID!
    $maisonMereAAPId: ID!
    $informationsCommerciales: CreateOrUpdateOnSiteOrganismGeneralInformationInput!
  ) {
    organism_createOrUpdateOnSiteOrganismGeneralInformation(
      organismId: $organismId
      maisonMereAAPId: $maisonMereAAPId
      informationsCommerciales: $informationsCommerciales
    ) {
      id
      adresseNumeroEtNomDeRue
      adresseVille
    }
  }
`);

const duplicateStreet = "10 rue de la République";
const duplicateCity = "Paris";

test("should block update when another lieu d'accueil of the maison mère already uses the target address", async () => {
  const maisonMere = await createMaisonMereAapHelper();
  const keycloakId = maisonMere.gestionnaire.keycloakId;

  const organismToUpdate = await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
    maisonMereAAPId: maisonMere.id,
    adresseNumeroEtNomDeRue: "25 avenue de la Paix",
    adresseVille: "Lyon",
    adresseCodePostal: "69001",
  });

  await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
    maisonMereAAPId: maisonMere.id,
    adresseNumeroEtNomDeRue: duplicateStreet,
    adresseVille: duplicateCity,
    adresseCodePostal: "75001",
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "gestion_maison_mere_aap",
        keycloakId,
      }),
    },
  });

  await expect(
    graphqlClient.request(updateOnSiteInformationsMutation, {
      organismId: organismToUpdate.id,
      maisonMereAAPId: maisonMere.id,
      informationsCommerciales: {
        nomPublic: organismToUpdate.nomPublic,
        telephone: organismToUpdate.telephone,
        siteInternet: organismToUpdate.siteInternet,
        emailContact: organismToUpdate.emailContact,
        adresseNumeroEtNomDeRue: duplicateStreet,
        adresseVille: duplicateCity,
        adresseCodePostal: "75001",
        conformeNormesAccessibilite: "CONFORME",
      },
    }),
  ).rejects.toThrowError("Un lieu d'accueil existe déjà avec cette adresse.");
});

test("should allow update when the matching address belongs to a different maison mère", async () => {
  const maisonMere = await createMaisonMereAapHelper();
  const keycloakId = maisonMere.gestionnaire.keycloakId;

  const otherMaisonMere = await createMaisonMereAapHelper();

  const organismToUpdate = await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
    maisonMereAAPId: maisonMere.id,
    adresseNumeroEtNomDeRue: "5 rue Victor Hugo",
    adresseVille: "Lille",
    adresseCodePostal: "59800",
  });

  await createOrganismHelper({
    modaliteAccompagnement: "LIEU_ACCUEIL",
    maisonMereAAPId: otherMaisonMere.id,
    adresseNumeroEtNomDeRue: duplicateStreet,
    adresseVille: duplicateCity,
    adresseCodePostal: "75001",
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "gestion_maison_mere_aap",
        keycloakId,
      }),
    },
  });

  const response = await graphqlClient.request(
    updateOnSiteInformationsMutation,
    {
      organismId: organismToUpdate.id,
      maisonMereAAPId: maisonMere.id,
      informationsCommerciales: {
        nomPublic: organismToUpdate.nomPublic,
        telephone: organismToUpdate.telephone,
        siteInternet: organismToUpdate.siteInternet,
        emailContact: organismToUpdate.emailContact,
        adresseNumeroEtNomDeRue: duplicateStreet,
        adresseVille: duplicateCity,
        adresseCodePostal: "75001",
        conformeNormesAccessibilite: "CONFORME",
      },
    },
  );

  expect(
    response.organism_createOrUpdateOnSiteOrganismGeneralInformation,
  ).toMatchObject({
    id: organismToUpdate.id,
    adresseNumeroEtNomDeRue: duplicateStreet,
    adresseVille: duplicateCity,
  });

  const updatedOrganism = await prismaClient.organism.findUnique({
    where: { id: organismToUpdate.id },
  });

  expect(updatedOrganism?.adresseNumeroEtNomDeRue).toBe(duplicateStreet);
  expect(updatedOrganism?.adresseVille).toBe(duplicateCity);
});
