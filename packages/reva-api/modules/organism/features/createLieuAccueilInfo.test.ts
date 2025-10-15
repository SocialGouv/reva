import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createMaisonMereAapHelper } from "@/test/helpers/entities/create-maison-mere-aap-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const createLieuAccueilInfoMutation = graphql(`
  mutation createLieuAccueilInfo($data: CreateLieuAccueilInfoInput!) {
    organism_createLieuAccueilInfo(data: $data)
  }
`);

const duplicateStreet = "10 rue de la République";
const duplicateCity = "Paris";

test("should block creation of a new lieu d'accueil when another one shares the same address within the maison mère", async () => {
  const maisonMere = await createMaisonMereAapHelper();
  const keycloakId = maisonMere.gestionnaire.keycloakId;

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
    graphqlClient.request(createLieuAccueilInfoMutation, {
      data: {
        nomPublic: "Agence République",
        adresseNumeroEtNomDeRue: duplicateStreet,
        adresseCodePostal: "75001",
        adresseVille: duplicateCity,
        emailContact: "agence@example.com",
        telephone: "0102030405",
        conformeNormesAccessibilite: "CONFORME",
      },
    }),
  ).rejects.toThrowError("Un lieu d'accueil existe déjà avec cette adresse.");
});

test("should allow creation when the same address belongs to another maison mère", async () => {
  const maisonMere = await createMaisonMereAapHelper();
  const keycloakId = maisonMere.gestionnaire.keycloakId;

  const otherMaisonMere = await createMaisonMereAapHelper();

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

  await graphqlClient.request(createLieuAccueilInfoMutation, {
    data: {
      nomPublic: "Agence République",
      adresseNumeroEtNomDeRue: duplicateStreet,
      adresseCodePostal: "75001",
      adresseVille: duplicateCity,
      emailContact: "agence@example.com",
      telephone: "0102030405",
      conformeNormesAccessibilite: "CONFORME",
    },
  });

  const created = await prismaClient.organism.findFirst({
    where: {
      maisonMereAAPId: maisonMere.id,
      adresseNumeroEtNomDeRue: duplicateStreet,
      adresseVille: duplicateCity,
    },
  });

  expect(created).not.toBeNull();
});
