import { Organism } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { attachOrganismToAllDegreesHelper } from "@/test/helpers/attach-organism-to-all-degrees-helper";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { createOrganismOnConventionCollectiveHelper } from "@/test/helpers/entities/create-organism-on-convention-collective-helper";
import { createParcoursCertificationHelper } from "@/test/helpers/entities/create-parcours-certification-helper";
import { createCohorteVaeCollectiveHelper } from "@/test/helpers/entities/create-vae-collective-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../graphql/generated";

const createCertifications = async () => {
  for (const cert of particulierEmployeurCertifications) {
    await createCertificationHelper({
      label: cert.label,
    });
  }
};

async function searchCertificationsForCandidate({
  searchText,
  organism,
  candidacyId,
  cohorteVaeCollectiveIdFilter,
}: {
  searchText?: string;
  organism?: Organism | null;
  candidacyId?: string;
  cohorteVaeCollectiveIdFilter?: string;
}) {
  return await injectGraphql({
    fastify: global.testApp,
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
        ...(candidacyId ? { candidacyId } : {}),
        ...(cohorteVaeCollectiveIdFilter
          ? { cohorteVaeCollectiveIdFilter }
          : {}),
      },
      returnFields: "{ rows { label }, info { totalRows } }",
    },
  });
}

const getCertificationAndParcoursQuery = graphql(`
  query getCertificationAndParcours(
    $certificationId: ID!
    $searchFilter: String
  ) {
    getCertification(certificationId: $certificationId) {
      parcours(searchFilter: $searchFilter) {
        rows {
          id
        }
      }
    }
  }
`);

const getCertificationAndParcours = async ({
  certificationId,
  searchFilter,
}: {
  certificationId: string;
  searchFilter?: string;
}) => {
  const graphqlClient = getGraphQLClient({});
  return graphqlClient.request(getCertificationAndParcoursQuery, {
    certificationId,
    searchFilter,
  });
};

const particulierEmployeurCertifications = [
  "Titre à finalité professionnelle Assistant de vie dépendance (ADVD)",
  "Titre à finalité professionnelle Assistant maternel / garde d'enfants ",
  "Titre à finalité professionnelle Employé familial",
].map((label) => ({ label }));

/**
 * Test search certifications by a candidate
 */
test("should have 208 certifications available in total", async () => {
  const resp = await searchCertificationsForCandidate({});
  const obj = resp.json();
  expect(
    obj.data.searchCertificationsForCandidate.info.totalRows,
  ).toBeGreaterThanOrEqual(208);
});

/**
 * Test search certifications by an organism for reorientation purpose
 */

test("should have only certifications handle by expertBranche", async () => {
  await createCertifications();

  const particulierEmployeur =
    await prismaClient.conventionCollective.findFirst({
      where: {
        label: "Particuliers employeurs et emploi à domicile",
      },
    });

  const organismExpertBranche = await createOrganismHelper({
    typology: "expertBranche",
  });
  await attachOrganismToAllDegreesHelper(organismExpertBranche);
  await createOrganismOnConventionCollectiveHelper({
    ccnId: particulierEmployeur?.id || "",
    organismId: organismExpertBranche.id,
  });

  const resp = await searchCertificationsForCandidate({
    organism: organismExpertBranche,
  });
  const obj = resp.json();
  // expertBranche handle only "particulier employeur" branche
  expect(obj.data.searchCertificationsForCandidate.rows).toEqual(
    particulierEmployeurCertifications,
  );
});

describe("VAE collective", () => {
  /**
   * Test search certifications by a candidate restricted by a VAE collective cohort
   */
  test("should return all certifications when searching with a VAE collective cohort without any certification restriction", async () => {
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper();

    const candidacy = await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });
    const resp = await searchCertificationsForCandidate({
      candidacyId: candidacy.id,
    });
    const obj = resp.json();
    expect(
      obj.data.searchCertificationsForCandidate.info.totalRows,
    ).toBeGreaterThanOrEqual(212);
  });

  /**
   * Test search certifications by a candidate restricted by a VAE collective cohort
   */
  test("should only return certifications available for the candidacy's VAE collective cohort", async () => {
    const certificationVaeCollective = await createCertificationHelper();
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      certificationCohorteVaeCollectives: {
        create: { certificationId: certificationVaeCollective.id },
      },
    });

    const candidacy = await createCandidacyHelper({
      candidacyArgs: { cohorteVaeCollectiveId: cohorteVaeCollective.id },
    });
    const resp = await searchCertificationsForCandidate({
      candidacyId: candidacy.id,
    });
    const obj = resp.json();
    expect(obj.data.searchCertificationsForCandidate.info.totalRows).toBe(1);
  });

  /**
   * Test search certifications with a cohorte VAE collective ID filter
   */
  test("should only return certifications available for the VAE collective cohort", async () => {
    const certificationVaeCollective = await createCertificationHelper();
    const cohorteVaeCollective = await createCohorteVaeCollectiveHelper({
      certificationCohorteVaeCollectives: {
        create: { certificationId: certificationVaeCollective.id },
      },
    });

    const resp = await searchCertificationsForCandidate({
      cohorteVaeCollectiveIdFilter: cohorteVaeCollective.id,
    });
    const obj = resp.json();
    expect(obj.data.searchCertificationsForCandidate.info.totalRows).toBe(1);
  });
});

describe("Parcours certification", () => {
  test("should return all parcours certifications for a certification and only those parcours", async () => {
    const certification = await createCertificationHelper();
    const parcoursCertification = await createParcoursCertificationHelper({
      certificationId: certification.id,
    });
    await createParcoursCertificationHelper(); //parcours not attached to the certification

    const resp = await getCertificationAndParcours({
      certificationId: certification.id,
    });
    expect(resp.getCertification.parcours.rows).toEqual([
      { id: parcoursCertification.id },
    ]);
  });

  test("should return all parcours certifications for a certification matching the search filter", async () => {
    const certification = await createCertificationHelper();
    const parcoursCertification = await createParcoursCertificationHelper({
      certificationId: certification.id,
      label: "Parcours 1",
    });
    const parcoursCertification2 = await createParcoursCertificationHelper({
      certificationId: certification.id,
      label: "Parcours 2",
    });

    await createParcoursCertificationHelper({
      certificationId: certification.id,
      label: "Should not return this one",
    });

    const resp = await getCertificationAndParcours({
      certificationId: certification.id,
      searchFilter: "Parcours",
    });
    expect(resp.getCertification.parcours.rows).toEqual([
      { id: parcoursCertification.id },
      { id: parcoursCertification2.id },
    ]);
  });

  test("should not return a certification if it has parcours but no certification authority is linked", async () => {
    const certification = await createCertificationHelper({
      label: "Certif without authority",
    });
    await createParcoursCertificationHelper({
      certificationId: certification.id,
    });

    const resp = await searchCertificationsForCandidate({
      searchText: "Certif without authority",
    });
    const obj = resp.json();
    expect(obj.data.searchCertificationsForCandidate.info.totalRows).toBe(0);
  });

  test("should return a certification if it has parcours and a certification authority is linked to at least one parcours", async () => {
    const certificationWithAuthority = await createCertificationHelper({
      label: "Certif with authority and parcours",
    });
    const parcoursCertificationWithAuthority =
      await createParcoursCertificationHelper({
        certificationId: certificationWithAuthority.id,
      });
    await createCertificationAuthorityHelper({
      certificationAuthorityOnCertification: {
        create: {
          certificationId: certificationWithAuthority.id,
          certificationAuthorityOnCertificationOnParcoursCertifications: {
            create: {
              parcoursCertificationId: parcoursCertificationWithAuthority.id,
            },
          },
        },
      },
    });

    const resp = await searchCertificationsForCandidate({
      searchText: "Certif with authority and parcours",
    });
    const obj = resp.json();
    expect(obj.data.searchCertificationsForCandidate.info.totalRows).toBe(1);
  });
});
