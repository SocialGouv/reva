import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import { NOT_AUTHORIZED_CANDIDACY_ACCESS } from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createDropOutReasonHelper } from "@/test/helpers/entities/create-drop-out-reason-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const candidacy_candidateDropOutCandidacy = graphql(`
  mutation candidacy_candidateDropOutCandidacy_authorization(
    $candidacyId: UUID!
    $dropOut: DropOutInput!
  ) {
    candidacy_candidateDropOutCandidacy(
      candidacyId: $candidacyId
      dropOut: $dropOut
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

const candidateDropOutCandidacy = ({
  authorization,
  candidacyId,
  dropOutReasonId,
}: {
  authorization?: string;
  candidacyId: string;
  dropOutReasonId: string;
}) => {
  const graphqlClient = getGraphQLClient({
    headers: authorization ? { authorization } : undefined,
  });

  return graphqlClient.request(candidacy_candidateDropOutCandidacy, {
    candidacyId,
    dropOut: { dropOutReasonId },
  });
};

describe("candidacy candidate-side resolver authorization", () => {
  describe("candidacy_candidateDropOutCandidacy", () => {
    test("allows the candidate owning the candidacy to drop it out", async () => {
      const candidacy = await createCandidacyHelper({
        candidacyActiveStatus:
          CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
      });
      const dropOutReason = await createDropOutReasonHelper();

      const response = await candidateDropOutCandidacy({
        authorization: asRole("candidate", candidacy.candidate!.keycloakId),
        candidacyId: candidacy.id,
        dropOutReasonId: dropOutReason.id,
      });

      expect(response.candidacy_candidateDropOutCandidacy.id).toBe(
        candidacy.id,
      );
    });

    test("rejects a random candidate for a candidacy they do not own", async () => {
      const candidacy = await createCandidacyHelper();
      const randomCandidate = await createCandidateHelper();

      await expect(
        candidateDropOutCandidacy({
          authorization: asRole("candidate", randomCandidate.keycloakId),
          candidacyId: candidacy.id,
          dropOutReasonId: faker.string.uuid(),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });

    test.each<KeyCloakUserRole>([
      "admin",
      "manage_candidacy",
      "gestion_maison_mere_aap",
      "manage_feasibility",
      "manage_certification_authority_local_account",
      "manage_certification_registry",
      "manage_vae_collective",
    ])(
      "rejects the %s actor without candidate ownership",
      async (role: KeyCloakUserRole) => {
        const candidacy = await createCandidacyHelper();

        await expect(
          candidateDropOutCandidacy({
            authorization: asRole(role),
            candidacyId: candidacy.id,
            dropOutReasonId: faker.string.uuid(),
          }),
        ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
      },
    );

    test("rejects an unauthenticated request", async () => {
      const candidacy = await createCandidacyHelper();

      await expect(
        candidateDropOutCandidacy({
          candidacyId: candidacy.id,
          dropOutReasonId: faker.string.uuid(),
        }),
      ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
    });
  });
});
