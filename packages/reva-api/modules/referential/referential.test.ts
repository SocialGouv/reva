/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { Department, Organism } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import {
  expertBrancheEtFiliereOrganism,
  expertBrancheOrganism,
  expertFiliereOrganism,
  generalisteOrganism,
} from "../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

async function attachOrganismToDepartment(
  organism: Organism | null,
  department: Department | null
) {
  await prismaClient.organismsOnDepartments.create({
    data: {
      departmentId: department?.id || "",
      organismId: organism?.id || "",
      isRemote: true,
      isOnSite: true,
    },
  });
}

async function getCertifications({
  department,
  searchText,
  organism,
}: {
  department: Department | null;
  searchText?: string;
  organism?: Organism | null;
}) {
  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "query",
      endpoint: "getCertifications",
      arguments: {
        departmentId: department?.id,
        offset: 0,
        limit: 10,
        ...(searchText ? { searchText } : {}),
        ...(organism ? { organismId: organism?.id || "" } : {}),
      },
      returnFields: "{ rows { label }, info { totalRows } }",
    },
  });
}

let ain: Department | null, paris: Department | null, loire: Department | null;
let generaliste: Organism | null,
  expertFiliere: Organism | null,
  expertBranche: Organism | null;

const particulierEmployeurCertifications = [
  "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
  "Titre à finalité professionnelle Assistant maternel / garde d'enfants ",
  "Titre à finalité professionnelle Employé familial",
].map((label) => ({ label }));

beforeAll(async () => {
  ain = await prismaClient.department.findFirst({ where: { code: "01" } });
  paris = await prismaClient.department.findFirst({ where: { code: "75" } });
  loire = await prismaClient.department.findFirst({ where: { code: "42" } });

  const social = await prismaClient.domaine.findFirst({
    where: { label: "Social" },
  });

  const particulierEmployeur =
    await prismaClient.conventionCollective.findFirst({
      where: {
        label: "Particuliers employeurs et emploi à domicile",
      },
    });

  generaliste = await prismaClient.organism.create({
    data: generalisteOrganism,
  });
  expertFiliere = await prismaClient.organism.create({
    data: expertFiliereOrganism,
  });
  expertBranche = await prismaClient.organism.create({
    data: expertBrancheOrganism,
  });
  await prismaClient.organism.create({
    data: expertBrancheEtFiliereOrganism,
  });

  // Généraliste fixtures
  await attachOrganismToDepartment(generaliste, paris);

  // Filière fixtures (also known as Domaine)
  await attachOrganismToDepartment(expertFiliere, paris);
  await prismaClient.organismOnDomaine.create({
    data: {
      domaineId: social?.id || "",
      organismId: expertFiliere?.id || "",
    },
  });

  // Branche fixtures (also known as Convention Collective)
  await attachOrganismToDepartment(expertBranche, paris);
  await attachOrganismToDepartment(expertBranche, loire);
  await prismaClient.organismOnConventionCollective.create({
    data: {
      ccnId: particulierEmployeur?.id || "",
      organismId: expertBranche?.id || "",
    },
  });
});

afterAll(async () => {
  await prismaClient.organismsOnDepartments.deleteMany({});
  await prismaClient.organism.deleteMany({});
});

/**
 * Test search certifications by a candidate
 */

test("should find certifications with keyword électricien available in Paris", async () => {
  const resp = await getCertifications({
    department: paris,
    searchText: "électricien",
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.getCertifications.rows).toEqual([
    { label: "BP Electricien" },
    { label: "CAP Electricien" },
  ]);
});

test("should have no certifications available in Ain", async () => {
  const resp = await getCertifications({ department: ain });
  const obj = resp.json();
  expect(obj.data.getCertifications.rows).toEqual([]);
  expect(obj.data.getCertifications.info.totalRows).toEqual(0);
});

test("should have only certifications of one branche in Loire", async () => {
  const resp = await getCertifications({ department: loire });
  const obj = resp.json();
  // In Loire we have only one organism, an expert on "particulier employeur" branche
  expect(obj.data.getCertifications.rows).toEqual(
    particulierEmployeurCertifications
  );
});

/**
 * Test search certifications by an organism for reorientation purpose
 */

test("should have several BTS certifications handle by generaliste in Paris", async () => {
  const resp = await getCertifications({
    organism: generaliste,
    department: paris,
    searchText: "BTS",
  });
  const obj = resp.json();
  expect(obj.data.getCertifications.info.totalRows).toEqual(17);
});

test("should have only BTS certifications handle by expertFiliere in Paris", async () => {
  const resp = await getCertifications({
    organism: expertFiliere,
    department: paris,
    searchText: "BTS",
  });
  const obj = resp.json();
  // expertFiliere handle only "social" domaine, and only one BTS is in this domaine
  expect(obj.data.getCertifications.rows).toEqual([
    { label: "BTS Economie sociale et familiale - ESF" },
  ]);
});

test("should have only certifications handle by expertBranche in Paris", async () => {
  const resp = await getCertifications({
    organism: expertBranche,
    department: paris,
  });
  const obj = resp.json();
  // expertBranche handle only "particulier employeur" branche
  expect(obj.data.getCertifications.rows).toEqual(
    particulierEmployeurCertifications
  );
});
