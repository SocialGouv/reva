import { faker } from "@faker-js/faker";
import { format } from "date-fns";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import {
  attachCollaborateurAccountToOrganism,
  createOrganismHelper,
} from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const candidacy_setReadyForJuryEstimatedAt = graphql(`
  mutation candidacy_setReadyForJuryEstimatedAt_authorization(
    $candidacyId: UUID!
    $readyForJuryEstimatedAt: Date!
  ) {
    candidacy_setReadyForJuryEstimatedAt(
      candidacyId: $candidacyId
      readyForJuryEstimatedAt: $readyForJuryEstimatedAt
    ) {
      id
    }
  }
`);

const asRole = (role: KeyCloakUserRole, keycloakId?: string) =>
  authorizationHeaderForUser({
    role,
    keycloakId: keycloakId ?? faker.string.uuid(),
  });

const setReadyForJuryEstimatedAt = ({
  authorization,
  candidacyId,
  readyForJuryEstimatedAt,
}: {
  authorization?: string;
  candidacyId: string;
  readyForJuryEstimatedAt: Date;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

  return graphqlClient.request(candidacy_setReadyForJuryEstimatedAt, {
    candidacyId,
    readyForJuryEstimatedAt: format(readyForJuryEstimatedAt, "yyyy-MM-dd"),
  });
};

const createForeignAapAuthorization = async () => {
  const organism = await createOrganismHelper();
  return asRole(
    "manage_candidacy",
    organism.organismOnAccounts[0].account.keycloakId,
  );
};

const createForeignMaisonMereManagerAuthorization = async () => {
  const organism = await createOrganismHelper();
  const manager = organism.maisonMereAAP!.gestionnaire;
  await attachCollaborateurAccountToOrganism({
    organismId: organism.id,
    collaborateurAccountId: manager.id,
  });
  return asRole("gestion_maison_mere_aap", manager.keycloakId);
};

const unsupportedProfessionalRoles: KeyCloakUserRole[] = [
  "manage_feasibility",
  "manage_certification_authority_local_account",
  "manage_certification_registry",
  "manage_vae_collective",
];

describe("candidacy jury resolver authorization", () => {
  describe("candidacy_setReadyForJuryEstimatedAt", () => {
    test("allows an admin to update the jury estimate", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await setReadyForJuryEstimatedAt({
        authorization: asRole("admin"),
        candidacyId: candidacy.id,
        readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
      });

      expect(response.candidacy_setReadyForJuryEstimatedAt.id).toBe(
        candidacy.id,
      );
    });

    test("allows the candidate owning the candidacy to update the jury estimate", async () => {
      const candidacy = await createCandidacyHelper();

      const response = await setReadyForJuryEstimatedAt({
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        candidacyId: candidacy.id,
        readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
      });

      expect(response.candidacy_setReadyForJuryEstimatedAt.id).toBe(
        candidacy.id,
      );
    });

    test("allows the AAP associated to the candidacy to update the jury estimate", async () => {
      const candidacy = await createCandidacyHelper();
      const aapKeycloakId =
        candidacy.organism!.organismOnAccounts[0].account.keycloakId;

      const response = await setReadyForJuryEstimatedAt({
        authorization: asRole("manage_candidacy", aapKeycloakId),
        candidacyId: candidacy.id,
        readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
      });

      expect(response.candidacy_setReadyForJuryEstimatedAt.id).toBe(
        candidacy.id,
      );
    });

    test("allows the maison mere manager of the AAP associated to the candidacy to update the jury estimate", async () => {
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

      const response = await setReadyForJuryEstimatedAt({
        authorization: asRole(
          "gestion_maison_mere_aap",
          maisonMereAAP.gestionnaire.keycloakId,
        ),
        candidacyId: candidacy.id,
        readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
      });

      expect(response.candidacy_setReadyForJuryEstimatedAt.id).toBe(
        candidacy.id,
      );
    });

    test("rejects a random candidate for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      await expect(
        setReadyForJuryEstimatedAt({
          authorization: asRole("candidate", randomCandidate.keycloakId),
          candidacyId: candidacy.id,
          readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });

    test("rejects a random AAP for a candidacy outside its scope", async () => {
      const candidacy = await createCandidacyHelper();
      await expect(
        setReadyForJuryEstimatedAt({
          authorization: await createForeignAapAuthorization(),
          candidacyId: candidacy.id,
          readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
    });

    test("rejects a maison mere manager from another maison mere", async () => {
      const candidacy = await createCandidacyHelper();
      await expect(
        setReadyForJuryEstimatedAt({
          authorization: await createForeignMaisonMereManagerAuthorization(),
          candidacyId: candidacy.id,
          readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
    });

    test.each(unsupportedProfessionalRoles)(
      "rejects the %s role",
      async (role: KeyCloakUserRole) => {
        await expect(
          setReadyForJuryEstimatedAt({
            authorization: asRole(role),
            candidacyId: faker.string.uuid(),
            readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
          }),
        ).rejects.toThrowError(NOT_AUTHORIZED);
      },
    );

    test("rejects an unauthenticated request", async () => {
      await expect(
        setReadyForJuryEstimatedAt({
          candidacyId: faker.string.uuid(),
          readyForJuryEstimatedAt: faker.date.soon({ days: 100 }),
        }),
      ).rejects.toThrowError(SESSION_EXPIRED);
    });
  });
});
