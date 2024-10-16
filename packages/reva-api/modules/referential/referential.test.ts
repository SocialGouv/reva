/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Organism } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import {
  expertBrancheEtFiliereOrganism,
  expertBrancheOrganism,
  expertFiliereOrganism,
  gestionnaireMaisonMereAAP1,
  maisonMereAAPExpertFiliere,
  gestionnaireMaisonMereAAP2,
  maisonMereAAPExpertBranche,
} from "../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import {
  createGestionnaireMaisonMereAapAccount1,
  createGestionnaireMaisonMereAapAccount2,
  createMaisonMereAAPExpertFiliere,
  createMaisonMereAAPExpertBranche,
} from "../../test/helpers/create-db-entity";

async function attachOrganismToAllDegrees(organism: Organism | null) {
  const degrees = await prismaClient.degree.findMany();
  for (const degree of degrees) {
    await prismaClient.organismOnDegree.create({
      data: {
        degreeId: degree?.id || "",
        organismId: organism?.id || "",
      },
    });
  }
}

async function searchCertificationsForCandidate({
  searchText,
  organism,
}: {
  searchText?: string;
  organism?: Organism | null;
}) {
  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "1b0e7046-ca61-4259-b716-785f36ab79b2",
    }),
    payload: {
      requestType: "query",
      endpoint: "searchCertificationsForCandidate",
      arguments: {
        offset: 0,
        limit: 10,
        ...(searchText ? { searchText } : {}),
        ...(organism ? { organismId: organism?.id || "" } : {}),
      },
      returnFields: "{ rows { label }, info { totalRows } }",
    },
  });
}

let expertFiliere: Organism | null, expertBranche: Organism | null;

const particulierEmployeurCertifications = [
  "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
  "Titre à finalité professionnelle Assistant maternel / garde d'enfants ",
  "Titre à finalité professionnelle Employé familial",
].map((label) => ({ label }));

beforeAll(async () => {
  const social = await prismaClient.domaine.findFirst({
    where: { label: "Social" },
  });

  const particulierEmployeur =
    await prismaClient.conventionCollective.findFirst({
      where: {
        label: "Particuliers employeurs et emploi à domicile",
      },
    });

  await createGestionnaireMaisonMereAapAccount1();
  await createGestionnaireMaisonMereAapAccount2();

  await createMaisonMereAAPExpertFiliere();
  await createMaisonMereAAPExpertBranche();

  expertFiliere = await prismaClient.organism.create({
    data: expertFiliereOrganism,
  });

  await prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPExpertFiliere.id },
    data: {
      organismes: {
        connect: [{ id: expertFiliere.id }],
      },
    },
  });

  expertBranche = await prismaClient.organism.create({
    data: expertBrancheOrganism,
  });

  await prismaClient.maisonMereAAP.update({
    where: { id: maisonMereAAPExpertBranche.id },
    data: {
      organismes: {
        connect: [{ id: expertBranche.id }],
      },
    },
  });

  await prismaClient.organism.create({
    data: expertBrancheEtFiliereOrganism,
  });

  // Filière fixtures (also known as Domaine)
  await prismaClient.organismOnDomaine.create({
    data: {
      domaineId: social?.id || "",
      organismId: expertFiliere?.id || "",
    },
  });

  // Branche fixtures (also known as Convention Collective)

  await attachOrganismToAllDegrees(expertFiliere);
  await attachOrganismToAllDegrees(expertBranche);

  await prismaClient.organismOnConventionCollective.create({
    data: {
      ccnId: particulierEmployeur?.id || "",
      organismId: expertBranche?.id || "",
    },
  });
});

afterAll(async () => {
  await prismaClient.organism.deleteMany({});

  await prismaClient.maisonMereAAP.delete({
    where: { id: maisonMereAAPExpertFiliere.id },
  });

  await prismaClient.maisonMereAAP.delete({
    where: { id: maisonMereAAPExpertBranche.id },
  });

  await prismaClient.account.delete({
    where: { id: gestionnaireMaisonMereAAP1.id },
  });

  await prismaClient.account.delete({
    where: { id: gestionnaireMaisonMereAAP2.id },
  });
});

/**
 * Test search certifications by a candidate
 */

test("should have 208 certifications available in total", async () => {
  const resp = await searchCertificationsForCandidate({});
  const obj = resp.json();
  expect(obj.data.searchCertificationsForCandidate.info.totalRows).toEqual(208);
});

/**
 * Test search certifications by an organism for reorientation purpose
 */

test("should have only BTS certifications handle by expertFiliere", async () => {
  const resp = await searchCertificationsForCandidate({
    organism: expertFiliere,
    searchText: "BTS",
  });
  const obj = resp.json();
  // expertFiliere handle only "social" domaine, and only one BTS is in this domaine
  expect(obj.data.searchCertificationsForCandidate.rows).toEqual([
    { label: "BTS Economie sociale et familiale - ESF" },
  ]);
});

test("should have only certifications handle by expertBranche", async () => {
  const resp = await searchCertificationsForCandidate({
    organism: expertBranche,
  });
  const obj = resp.json();
  // expertBranche handle only "particulier employeur" branche
  expect(obj.data.searchCertificationsForCandidate.rows).toEqual(
    particulierEmployeurCertifications,
  );
});
