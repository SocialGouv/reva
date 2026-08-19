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
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const getCandidacyCertification = graphql(`
  query getCandidacyCertification_authorization($id: ID!) {
    getCandidacyById(id: $id) {
      certification {
        id
      }
    }
  }
`);

const candidacy_certification_updateCertification = graphql(`
  mutation candidacy_certification_updateCertification_authorization(
    $candidacyId: ID!
    $certificationId: ID!
  ) {
    candidacy_certification_updateCertification(
      candidacyId: $candidacyId
      certificationId: $certificationId
    )
  }
`);

const candidacy_certification_updateCertificationWithinOrganismScope = graphql(`
  mutation candidacy_certification_updateCertificationWithinOrganismScope_authorization(
    $candidacyId: ID!
    $certificationId: ID!
  ) {
    candidacy_certification_updateCertificationWithinOrganismScope(
      candidacyId: $candidacyId
      certificationId: $certificationId
    )
  }
`);

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
}) => {
  const graphqlClient = getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

  return graphqlClient.request(candidacy_certification_updateCertification, {
    candidacyId,
    certificationId,
  });
};

const updateCertificationWithinOrganismScope = ({
  candidacyId,
  authorization,
}: {
  candidacyId: string;
  authorization?: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

  return graphqlClient.request(
    candidacy_certification_updateCertificationWithinOrganismScope,
    {
      candidacyId,
      certificationId: faker.string.uuid(),
    },
  );
};

describe("candidacy certification resolver authorization", () => {
  describe("Candidacy.certification", () => {
    test("allows the candidate owning the candidacy to access its certification", async () => {
      const candidacy = await createCandidacyHelper();

      const graphqlClient = getGraphQLClient({
        headers: {
          authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        },
      });
      const response = await graphqlClient.request(getCandidacyCertification, {
        id: candidacy.id,
      });

      expect(response.getCandidacyById?.certification?.id).toBe(
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

      await updateCertification({
        candidacyId: candidacy.id,
        certificationId: certification.id,
        authorization: asRole("admin"),
      });

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

      await updateCertification({
        candidacyId: candidacy.id,
        certificationId: certification.id,
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
      });

      const updatedCandidacy = await prismaClient.candidacy.findUniqueOrThrow({
        where: { id: candidacy.id },
        select: { certificationId: true },
      });
      expect(updatedCandidacy.certificationId).toBe(certification.id);
    });

    test("rejects a certification update from a random candidate for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      await expect(
        updateCertification({
          candidacyId: candidacy.id,
          authorization: asRole("candidate", randomCandidate.keycloakId),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });

    test.each<KeyCloakUserRole>([
      "manage_candidacy",
      "manage_feasibility",
      "gestion_maison_mere_aap",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      await expect(
        updateCertification({
          candidacyId: faker.string.uuid(),
          authorization: asRole(role),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      await expect(
        updateCertification({ candidacyId: faker.string.uuid() }),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });
  });

  describe("candidacy_certification_updateCertificationWithinOrganismScope", () => {
    test("allows an admin to request a certification update", async () => {
      await expect(
        updateCertificationWithinOrganismScope({
          candidacyId: faker.string.uuid(),
          authorization: asRole("admin"),
        }),
      ).rejects.toThrowError(CERTIFICATION_NON_TROUVEE);
    });

    test("allows the AAP associated to the candidacy to request a certification update", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;

      await expect(
        updateCertificationWithinOrganismScope({
          candidacyId: candidacy.id,
          authorization: asRole("manage_candidacy", aapKeycloakId),
        }),
      ).rejects.toThrowError(CERTIFICATION_NON_TROUVEE);
    });

    test("rejects a certification update from a random AAP for a candidacy it is not associated to", async () => {
      const candidacy = await createCandidacyHelper();
      const foreignOrganism = await createOrganismHelper();
      const foreignAapKeycloakId =
        foreignOrganism.organismOnAccounts[0].account.keycloakId;

      await expect(
        updateCertificationWithinOrganismScope({
          candidacyId: candidacy.id,
          authorization: asRole("manage_candidacy", foreignAapKeycloakId),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
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

      await expect(
        updateCertificationWithinOrganismScope({
          candidacyId: candidacy.id,
          authorization: asRole(
            "gestion_maison_mere_aap",
            maisonMereAAP.gestionnaire.keycloakId,
          ),
        }),
      ).rejects.toThrowError(CERTIFICATION_NON_TROUVEE);
    });

    test("rejects a certification update from a maison mere manager of another maison mere", async () => {
      const candidacy = await createCandidacyHelper();
      const foreignOrganism = await createOrganismHelper();
      const foreignMaisonMereAAP = foreignOrganism.maisonMereAAP!;
      await attachCollaborateurAccountToOrganism({
        organismId: foreignOrganism.id,
        collaborateurAccountId: foreignMaisonMereAAP.gestionnaire.id,
      });

      await expect(
        updateCertificationWithinOrganismScope({
          candidacyId: candidacy.id,
          authorization: asRole(
            "gestion_maison_mere_aap",
            foreignMaisonMereAAP.gestionnaire.keycloakId,
          ),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
    });

    test.each<KeyCloakUserRole>([
      "candidate",
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])("rejects the %s role", async (role: KeyCloakUserRole) => {
      await expect(
        updateCertificationWithinOrganismScope({
          candidacyId: faker.string.uuid(),
          authorization: asRole(role),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED);
    });

    test("rejects an unauthenticated request", async () => {
      await expect(
        updateCertificationWithinOrganismScope({
          candidacyId: faker.string.uuid(),
        }),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });
  });
});
