import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const confirmTrainingFormMutation = graphql(`
  mutation confirmTrainingForm($candidacyId: UUID!) {
    training_confirmTrainingForm(candidacyId: $candidacyId) {
      id
    }
  }
`);

const confirmTrainingForm = ({
  candidacyId,
  role,
  keycloakId,
}: {
  candidacyId: string;
  role?: KeyCloakUserRole;
  keycloakId?: string;
}) => {
  const graphqlClient = getGraphQLClient(
    role
      ? {
          headers: {
            authorization: authorizationHeaderForUser({ role, keycloakId }),
          },
        }
      : {},
  );

  return graphqlClient.request(confirmTrainingFormMutation, { candidacyId });
};

test("should be able to validate the training when candidacy status is PARCOURS_ENVOYE", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
  });

  const res = await confirmTrainingForm({
    candidacyId: candidacy.id,
    role: "candidate",
    keycloakId: candidacy.candidate?.keycloakId,
  });

  expect(res.training_confirmTrainingForm).toMatchObject({
    id: expect.any(String),
  });
});

describe("security", () => {
  test("admin: allowed", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
    });

    const res = await confirmTrainingForm({
      candidacyId: candidacy.id,
      role: "admin",
      keycloakId: faker.string.uuid(),
    });

    expect(res.training_confirmTrainingForm.id).toEqual(candidacy.id);
  });

  test("the AAP supporting the candidacy: allowed", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
    });
    const aapKeycloakId =
      candidacy.organism?.organismOnAccounts[0].account.keycloakId;

    const res = await confirmTrainingForm({
      candidacyId: candidacy.id,
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    });

    expect(res.training_confirmTrainingForm.id).toEqual(candidacy.id);
  });

  test("the owning candidate: allowed", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
    });

    const res = await confirmTrainingForm({
      candidacyId: candidacy.id,
      role: "candidate",
      keycloakId: candidacy.candidate?.keycloakId,
    });

    expect(res.training_confirmTrainingForm.id).toEqual(candidacy.id);
  });

  test("an AAP from another organism: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
    });
    const anotherOrganism = await createOrganismHelper();

    await expect(
      confirmTrainingForm({
        candidacyId: candidacy.id,
        role: "manage_candidacy",
        keycloakId: anotherOrganism.organismOnAccounts[0].account.keycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
  });

  test("another candidate: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
    });
    const anotherCandidate = await createCandidateHelper();

    await expect(
      confirmTrainingForm({
        candidacyId: candidacy.id,
        role: "candidate",
        keycloakId: anotherCandidate.keycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
  });

  test("a role with no permission on candidacies: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
    });

    await expect(
      confirmTrainingForm({
        candidacyId: candidacy.id,
        role: "manage_feasibility",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });

  test("unauthenticated: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PARCOURS_ENVOYE,
    });

    await expect(
      confirmTrainingForm({ candidacyId: candidacy.id }),
    ).rejects.toThrowError(SESSION_EXPIRED);
  });
});
