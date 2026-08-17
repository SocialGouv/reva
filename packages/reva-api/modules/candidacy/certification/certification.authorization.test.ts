import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import { CERTIFICATION_NON_TROUVEE } from "@/modules/shared/errors/messages";
import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import {
  attachCollaborateurAccountToOrganism,
  createOrganismHelper,
} from "@/test/helpers/entities/create-organism-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const updateCertification = ({
  candidacyId,
  certificationId = faker.string.uuid(),
  authorization,
}: {
  candidacyId: string;
  certificationId?: string;
  authorization?: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_certification_updateCertification",
      arguments: {
        candidacyId,
        certificationId,
      },
      returnFields: "",
    },
  });

const updateCertificationWithinOrganismScope = ({
  candidacyId,
  authorization,
}: {
  candidacyId: string;
  authorization?: string;
}) =>
  injectGraphql({
    fastify: global.testApp,
    authorization,
    payload: {
      requestType: "mutation",
      endpoint:
        "candidacy_certification_updateCertificationWithinOrganismScope",
      arguments: {
        candidacyId,
        certificationId: faker.string.uuid(),
      },
      returnFields: "",
    },
  });

describe("candidacy certification resolver authorization", () => {
  describe("Candidacy.certification", () => {
    test("allows the candidate owning the candidacy to access its certification", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await injectGraphql({
        fastify: global.testApp,
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        payload: {
          requestType: "query",
          endpoint: "getCandidacyById",
          arguments: { id: candidacy.id },
          returnFields: "{ certification { id } }",
        },
      });

      expect(response.json()).not.toHaveProperty("errors");
      expect(response.json().data.getCandidacyById.certification.id).toBe(
        candidacy.certificationId,
      );
    });
  });

  describe("candidacy_certification_updateCertification", () => {
    test("allows an admin to update the certification of any candidacy", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      const certification = await createCertificationHelper();

      const response = await updateCertification({
        candidacyId: candidacy.id,
        certificationId: certification.id,
        authorization: asRole("admin"),
      });

      expect(response.json()).not.toHaveProperty("errors");
      const updatedCandidacy = await prismaClient.candidacy.findUniqueOrThrow({
        where: { id: candidacy.id },
        select: { certificationId: true },
      });
      expect(updatedCandidacy.certificationId).toBe(certification.id);
    });

    test("allows the candidate owning the candidacy to update its certification", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus: CandidacyStatusStep.PROJET,
      });
      const certification = await createCertificationHelper();

      const response = await updateCertification({
        candidacyId: candidacy.id,
        certificationId: certification.id,
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
      });

      expect(response.json()).not.toHaveProperty("errors");
      const updatedCandidacy = await prismaClient.candidacy.findUniqueOrThrow({
        where: { id: candidacy.id },
        select: { certificationId: true },
      });
      expect(updatedCandidacy.certificationId).toBe(certification.id);
    });

    test("rejects a certification update from a random candidate for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      const response = await updateCertification({
        candidacyId: candidacy.id,
        authorization: asRole("candidate", randomCandidate.keycloakId),
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_ACCESS,
      );
    });

    test.each<KeyCloakUserRole>([
      "manage_candidacy",
      "manage_feasibility",
      "gestion_maison_mere_aap",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await updateCertification({
        candidacyId: faker.string.uuid(),
        authorization: asRole(role),
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await updateCertification({
        candidacyId: faker.string.uuid(),
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });

  describe("candidacy_certification_updateCertificationWithinOrganismScope", () => {
    test("allows an admin to request a certification update", async () => {
      const response = await updateCertificationWithinOrganismScope({
        candidacyId: faker.string.uuid(),
        authorization: asRole("admin"),
      });

      expect(response.json().errors[0].message).toBe(CERTIFICATION_NON_TROUVEE);
    });

    test("allows the AAP associated to the candidacy to request a certification update", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;

      const response = await updateCertificationWithinOrganismScope({
        candidacyId: candidacy.id,
        authorization: asRole("manage_candidacy", aapKeycloakId),
      });

      expect(response.json().errors[0].message).toBe(CERTIFICATION_NON_TROUVEE);
    });

    test("rejects a certification update from a random AAP for a candidacy it is not associated to", async () => {
      const candidacy = await createCandidacyHelper();
      const foreignOrganism = await createOrganismHelper();
      const foreignAapKeycloakId =
        foreignOrganism.organismOnAccounts[0].account.keycloakId;

      const response = await updateCertificationWithinOrganismScope({
        candidacyId: candidacy.id,
        authorization: asRole("manage_candidacy", foreignAapKeycloakId),
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_MANAGE,
      );
    });

    test("allows the maison mere manager of the AAP associated to the candidacy to request a certification update", async () => {
      const organism = await createOrganismHelper();
      const maisonMereAAP = organism.maisonMereAAP!;
      const siblingOrganism = await createOrganismHelper({
        maisonMereAAPId: maisonMereAAP.id,
      });
      await attachCollaborateurAccountToOrganism({
        organismId: siblingOrganism.id,
        collaborateurAccountId: maisonMereAAP.gestionnaire.id,
      });
      const candidacy = await createCandidacyHelper({
        candidacyArgs: { organismId: organism.id },
      });

      const response = await updateCertificationWithinOrganismScope({
        candidacyId: candidacy.id,
        authorization: asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
      });

      expect(response.json().errors[0].message).toBe(CERTIFICATION_NON_TROUVEE);
    });

    test("rejects a certification update from a maison mere manager of another maison mere", async () => {
      const candidacy = await createCandidacyHelper();
      const foreignOrganism = await createOrganismHelper();
      const foreignMaisonMereAAP = foreignOrganism.maisonMereAAP!;
      await attachCollaborateurAccountToOrganism({
        organismId: foreignOrganism.id,
        collaborateurAccountId: foreignMaisonMereAAP.gestionnaire.id,
      });

      const response = await updateCertificationWithinOrganismScope({
        candidacyId: candidacy.id,
        authorization: asRole(
          "gestion_maison_mere_aap",
          foreignMaisonMereAAP.gestionnaire.keycloakId,
        ),
      });

      expect(response.json().errors[0].message).toBe(
        NOT_AUTHORIZED_CANDIDACY_MANAGE,
      );
    });

    test.each<KeyCloakUserRole>([
      "candidate",
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      const response = await updateCertificationWithinOrganismScope({
        candidacyId: faker.string.uuid(),
        authorization: asRole(role),
      });

      expect(response.json().errors[0].message).toBe(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      const response = await updateCertificationWithinOrganismScope({
        candidacyId: faker.string.uuid(),
      });

      expect(response.json().errors[0].message).toBe(SESSION_EXPIRED);
    });
  });
});
