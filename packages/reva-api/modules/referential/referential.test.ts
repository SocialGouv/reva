/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Organism } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import {
  MAISON_MERE_AAP_EXPERT_BRANCHE,
  MAISON_MERE_AAP_EXPERT_FILIERE,
  ORGANISM_EXPERT_BRANCHE,
  ORGANISM_EXPERT_BRANCHE_ET_FILIERE,
  ORGANISM_EXPERT_FILIERE,
} from "../../test/fixtures";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import {
  createMaisonMereAAPExpertBranche,
  createMaisonMereExpertFiliere,
} from "../../test/helpers/create-db-entity";
import { injectGraphql } from "../../test/helpers/graphql-helper";

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
  const particulierEmployeur =
    await prismaClient.conventionCollective.findFirst({
      where: {
        label: "Particuliers employeurs et emploi à domicile",
      },
    });

  await createMaisonMereExpertFiliere();
  await createMaisonMereAAPExpertBranche();

  expertFiliere = await prismaClient.organism.create({
    data: ORGANISM_EXPERT_FILIERE,
  });

  await prismaClient.maisonMereAAP.update({
    where: { id: MAISON_MERE_AAP_EXPERT_FILIERE.id },
    data: {
      organismes: {
        connect: [{ id: expertFiliere.id }],
      },
    },
  });

  expertBranche = await prismaClient.organism.create({
    data: ORGANISM_EXPERT_BRANCHE,
  });

  await prismaClient.maisonMereAAP.update({
    where: { id: MAISON_MERE_AAP_EXPERT_BRANCHE.id },
    data: {
      organismes: {
        connect: [{ id: expertBranche.id }],
      },
    },
  });

  await prismaClient.organism.create({
    data: ORGANISM_EXPERT_BRANCHE_ET_FILIERE,
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
