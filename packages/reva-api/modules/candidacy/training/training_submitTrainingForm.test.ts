import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import {
  NOT_AUTHORIZED,
  NOT_AUTHORIZED_CANDIDACY_ACCESS,
  NOT_AUTHORIZED_CANDIDACY_MANAGE,
  SESSION_EXPIRED,
} from "@/modules/shared/security/messages";
import { TRAINING_INPUT } from "@/test/fixtures/trainings.fixture";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import { graphql } from "../../graphql/generated";

const submitTrainingFormMutation = graphql(`
  mutation submitTrainingForm($candidacyId: UUID!, $training: TrainingInput!) {
    training_submitTrainingForm(
      candidacyId: $candidacyId
      training: $training
    ) {
      id
    }
  }
`);

const submitTrainingForm = ({
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

  return graphqlClient.request(submitTrainingFormMutation, {
    candidacyId,
    training: TRAINING_INPUT,
  });
};

describe("security", () => {
  test("admin: allowed", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

    const res = await submitTrainingForm({
      candidacyId: candidacy.id,
      role: "admin",
      keycloakId: faker.string.uuid(),
    });

    expect(res.training_submitTrainingForm.id).toEqual(candidacy.id);
  });

  test("the AAP supporting the candidacy: allowed", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
    });
    const aapKeycloakId =
      candidacy.organism?.organismOnAccounts[0].account.keycloakId;

    const res = await submitTrainingForm({
      candidacyId: candidacy.id,
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    });

    expect(res.training_submitTrainingForm.id).toEqual(candidacy.id);
  });

  test("the owning candidate: allowed", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

    const res = await submitTrainingForm({
      candidacyId: candidacy.id,
      role: "candidate",
      keycloakId: candidacy.candidate?.keycloakId,
    });

    expect(res.training_submitTrainingForm.id).toEqual(candidacy.id);
  });

  test("an AAP from another organism: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
    });
    const anotherOrganism = await createOrganismHelper();

    await expect(
      submitTrainingForm({
        candidacyId: candidacy.id,
        role: "manage_candidacy",
        keycloakId: anotherOrganism.organismOnAccounts[0].account.keycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_MANAGE);
  });

  test("another candidate: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
    });
    const anotherCandidate = await createCandidateHelper();

    await expect(
      submitTrainingForm({
        candidacyId: candidacy.id,
        role: "candidate",
        keycloakId: anotherCandidate.keycloakId,
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED_CANDIDACY_ACCESS);
  });

  test("a role with no permission on candidacies: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

    await expect(
      submitTrainingForm({
        candidacyId: candidacy.id,
        role: "manage_feasibility",
      }),
    ).rejects.toThrowError(NOT_AUTHORIZED);
  });

  test("unauthenticated: denied", async () => {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

    await expect(
      submitTrainingForm({ candidacyId: candidacy.id }),
    ).rejects.toThrowError(SESSION_EXPIRED);
  });
});
