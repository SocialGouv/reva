import { Organism } from "@prisma/client";

import { prismaClient } from "../../prisma/client";
import { attachOrganismToAllDegreesHelper } from "../../test/helpers/attach-organism-to-all-degrees-helper";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "../../test/helpers/entities/create-certification-helper";
import { createOrganismHelper } from "../../test/helpers/entities/create-organism-helper";
import { createOrganismOnConventionCollectiveHelper } from "../../test/helpers/entities/create-organism-on-convention-collective-helper";
import { createCohorteVaeCollectiveHelper } from "../../test/helpers/entities/create-vae-collective-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";

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
}: {
  searchText?: string;
  organism?: Organism | null;
  candidacyId?: string;
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
        ...(candidacyId ? { candidacyId } : {}),
      },
      returnFields: "{ rows { label }, info { totalRows } }",
    },
  });
}

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
  test("should only return the certification available for the VAE collective cohort", async () => {
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
});
