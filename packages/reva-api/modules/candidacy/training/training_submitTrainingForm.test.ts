import { faker } from "@faker-js/faker";
import { CandidacyStatusStep } from "@prisma/client";

import { CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID } from "@/modules/referential/referential.types";
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
      status
    }
  }
`);

const submitTrainingForm = ({
  candidacyId,
  training = TRAINING_INPUT,
  role,
  keycloakId,
}: {
  candidacyId: string;
  training?: Record<string, unknown>;
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
    training,
  });
};

test("should not be able to submit a training form if its status is in 'PROJET'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: CandidacyStatusStep.PROJET,
  });
  const aapKeycloakId =
    candidacy.organism?.organismOnAccounts[0].account.keycloakId;

  await expect(
    submitTrainingForm({
      candidacyId: candidacy.id,
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    }),
  ).rejects.toThrowError(
    "Ce parcours ne peut pas être envoyé car la candidature n'est pas encore prise en charge.",
  );
});

test("should be able to submit a basic training form when candidacy status is 'PRISE_EN_CHARGE' and its finance module is 'unifvae'", async () => {
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

  expect(res.training_submitTrainingForm).toMatchObject({
    status: "PARCOURS_ENVOYE",
  });
});

test("should not be able to submit a basic training form without at least one financing method when candidacy financeModule is 'hors_plateforme'", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyArgs: { financeModule: "hors_plateforme" },
    candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
  });
  const aapKeycloakId =
    candidacy.organism?.organismOnAccounts[0].account.keycloakId;

  await expect(
    submitTrainingForm({
      candidacyId: candidacy.id,
      training: { ...TRAINING_INPUT },
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    }),
  ).rejects.toThrowError(
    "Au moins une modalité de financement doit être renseignée",
  );
});

test("should not be able to submit a basic training form with an 'other source' financing method without an additional information text", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyArgs: { financeModule: "hors_plateforme" },
    candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
  });
  const aapKeycloakId =
    candidacy.organism?.organismOnAccounts[0].account.keycloakId;

  await expect(
    submitTrainingForm({
      candidacyId: candidacy.id,
      training: {
        ...TRAINING_INPUT,
        candidacyFinancingMethodInfos: [
          {
            candidacyFinancingMethodId:
              CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID,
            amount: 4,
          },
        ],
      },
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    }),
  ).rejects.toThrowError(
    "Un motif doit être renseigné quand la modalité de financement 'Autre source de financement' est cochée",
  );
});

test("should be able to submit a basic training form with an 'other source' financing method with an additional information text", async () => {
  const candidacy = await createCandidacyHelper({
    candidacyArgs: { financeModule: "hors_plateforme" },
    candidacyActiveStatus: CandidacyStatusStep.PRISE_EN_CHARGE,
  });
  const aapKeycloakId =
    candidacy.organism?.organismOnAccounts[0].account.keycloakId;

  const res = await submitTrainingForm({
    candidacyId: candidacy.id,
    training: {
      ...TRAINING_INPUT,
      candidacyFinancingMethodInfos: [
        {
          candidacyFinancingMethodId:
            CANDIDACY_FINANCING_METHOD_OTHER_SOURCE_ID,
          amount: 4,
          additionalInformation: "Autre source",
        },
      ],
    },
    role: "manage_candidacy",
    keycloakId: aapKeycloakId,
  });

  expect(res.training_submitTrainingForm).toMatchObject({
    status: "PARCOURS_ENVOYE",
  });
});

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
