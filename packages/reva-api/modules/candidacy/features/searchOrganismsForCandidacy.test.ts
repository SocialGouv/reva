/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { faker } from "@faker-js/faker/.";
import { prismaClient } from "../../../prisma/client";
import { attachOrganismToAllConventionCollectiveHelper } from "../../../test/helpers/attach-organism-to-all-ccn-helper";
import { attachOrganismToAllDegreesHelper } from "../../../test/helpers/attach-organism-to-all-degrees-helper";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "../../../test/helpers/entities/create-certification-helper";
import { createMaisonMereAapHelper } from "../../../test/helpers/entities/create-maison-mere-aap-helper";
import { createOrganismHelper } from "../../../test/helpers/entities/create-organism-helper";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";

const searchOrganisms = async ({
  keycloakId,
  candidacyId,
  searchFilter,
  searchText = "",
}: {
  keycloakId: string;
  candidacyId: string;
  searchFilter: {
    distanceStatus?: "ONSITE" | "REMOTE";
    pmr?: boolean;
    zip?: string;
    isMcfCompatible?: boolean;
  };
  searchText?: string;
}) =>
  injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "getRandomOrganismsForCandidacy",
      arguments: {
        candidacyId,
        searchFilter: {
          ...searchFilter,
          zip: searchFilter.zip ?? "",
        },
        searchText,
      },
      enumFields: ["distanceStatus"],
      returnFields: "{rows {id, label}, totalRows}",
    },
  });

const ccnServicePersonne = {
  ccn: { connect: { code: "3127" } },
};

afterEach(async () => {
  await clearDatabase();
});

describe("searchOrganismsForCandidacy", () => {
  describe("Basic search scenarios", () => {
    test("should return empty result when certification has no associated organisms", async () => {
      const certification = await prismaClient.certification.findFirst();
      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {},
      });

      expect(resp.statusCode).toEqual(200);
      const randomOrganisms = resp.json().data.getRandomOrganismsForCandidacy;
      expect(randomOrganisms.totalRows).toBe(0);
    });

    test("should return organism when it matches certification CCN and degree level", async () => {
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

      const organism = await createOrganismHelper();

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {},
      });

      expect(resp.statusCode).toEqual(200);
      const randomOrganisms = resp.json().data.getRandomOrganismsForCandidacy;
      expect(randomOrganisms.totalRows).toBe(1);
      expect(randomOrganisms.rows[0].id).toBe(organism.id);
    });

    test("should filter organisms by search text", async () => {
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
        label: "Test Organism Name",
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {},
        searchText: "Test Organism",
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(1);
      expect(results.rows[0].label).toContain("Test Organism");
    });
  });

  describe("Distance status filtering", () => {
    test("should filter organisms by distance status REMOTE", async () => {
      const certification = await createCertificationHelper({
        certificationOnConventionCollective: {
          create: ccnServicePersonne,
        },
      });

      const organism = await createOrganismHelper({
        modaliteAccompagnement: "A_DISTANCE",
      });

      await prismaClient.organismOnRemoteZone.create({
        data: {
          organismId: organism.id,
          remoteZone: "FRANCE_METROPOLITAINE",
        },
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          distanceStatus: "REMOTE",
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(1);
    });

    test("should filter organisms by distance status ONSITE", async () => {
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

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          distanceStatus: "ONSITE",
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(1);
    });
  });

  describe("MCF compatibility filtering", () => {
    test("should filter organisms by MCF compatibility", async () => {
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

      const maisonMereAAP = await createMaisonMereAapHelper({
        isMCFCompatible: true,
      });
      const organism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          isMcfCompatible: true,
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(1);
    });
  });

  describe("PMR accessibility filtering", () => {
    test("should filter organisms by PMR accessibility when searching by zipcode", async () => {
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

      const organism = await createOrganismHelper();

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          pmr: true,
          zip: "75001",
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(1);
    });

    test("should not find an organisms when searching for PMR accessibility whith an onSite organism not PMR compatible without entering a zipcode", async () => {
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
        conformeNormesAccessibilite: "NON_CONFORME",
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          distanceStatus: "ONSITE",
          pmr: true,
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(0);
    });

    test("should find an organism with PMR accessibility when searching for an onSite organism PMR compatible without entering a zipcode", async () => {
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

      const pmrOrganism = await createOrganismHelper({
        modaliteAccompagnement: "LIEU_ACCUEIL",
      });

      await attachOrganismToAllDegreesHelper(pmrOrganism);
      await attachOrganismToAllConventionCollectiveHelper(pmrOrganism);

      const nonPmrOrganism = await createOrganismHelper({
        modaliteAccompagnement: "LIEU_ACCUEIL",
        conformeNormesAccessibilite: "NON_CONFORME",
      });

      await attachOrganismToAllDegreesHelper(nonPmrOrganism);
      await attachOrganismToAllConventionCollectiveHelper(nonPmrOrganism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          distanceStatus: "ONSITE",
          pmr: true,
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(1);
      expect(results.rows[0].id).toBe(pmrOrganism.id);
    });
  });

  describe("Error handling", () => {
    test("should throw error when candidacy not found", async () => {
      const resp = await searchOrganisms({
        keycloakId: faker.string.uuid(),
        candidacyId: faker.string.uuid(),
        searchFilter: {},
      });

      expect(resp.statusCode).toEqual(200);
      const error = resp.json().errors[0];
      expect(error.message).toBe("Candidature non trouvée");
    });
  });

  describe("Filtering edge cases", () => {
    test("should not return organisms when modalite_accompagnement_renseignee_et_valide is false", async () => {
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
        modaliteAccompagnementRenseigneeEtValide: false,
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {},
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(0);
    });

    test("should not return organisms when remote zone doesn't match", async () => {
      const certification = await createCertificationHelper({
        certificationOnConventionCollective: {
          create: ccnServicePersonne,
        },
      });

      const organism = await createOrganismHelper({
        modaliteAccompagnement: "A_DISTANCE",
      });

      await prismaClient.organismOnRemoteZone.create({
        data: {
          organismId: organism.id,
          remoteZone: "MARTINIQUE",
        },
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          distanceStatus: "REMOTE",
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(0);
    });

    test("should not return organisms when MCF compatibility doesn't match", async () => {
      const certification = await createCertificationHelper();
      const maisonMereAAP = await createMaisonMereAapHelper({
        isMCFCompatible: false,
      });
      const organism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          isMcfCompatible: true,
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(0);
    });

    test("should not return organisms when PMR accessibility doesn't match", async () => {
      const certification = await createCertificationHelper();
      const organism = await createOrganismHelper({
        adresseCodePostal: faker.location.zipCode(),
        adresseInformationsComplementaires: faker.location.streetAddress(),
        adresseNumeroEtNomDeRue: faker.location.streetAddress(),
        adresseVille: faker.location.city(),
        conformeNormesAccessibilite: "ETABLISSEMENT_NE_RECOIT_PAS_DE_PUBLIC",
        emailContact: faker.internet.email(),
        nomPublic: faker.person.fullName(),
        siteInternet: faker.internet.url(),
        telephone: faker.phone.number(),
      });

      await attachOrganismToAllDegreesHelper(organism);
      await attachOrganismToAllConventionCollectiveHelper(organism);

      const candidacy = await createCandidacyHelper({
        candidacyArgs: {
          certificationId: certification?.id,
        },
      });

      const resp = await searchOrganisms({
        keycloakId: candidacy.candidate?.keycloakId ?? "",
        candidacyId: candidacy.id,
        searchFilter: {
          pmr: true,
          zip: "75001",
        },
      });

      expect(resp.statusCode).toEqual(200);
      const results = resp.json().data.getRandomOrganismsForCandidacy;
      expect(results.totalRows).toBe(0);
    });
  });
});
