import {
  CandidacyStatusStep,
  FormacodeType,
  OrganismTypology,
} from "@prisma/client";

import { graphql } from "@/modules/graphql/generated";
import { prismaClient } from "@/prisma/client";
import { TRAINING_INPUT } from "@/test/fixtures/trainings.fixture";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeatureHelper } from "@/test/helpers/entities/create-feature-helper";
import { createOrganismHelper } from "@/test/helpers/entities/create-organism-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

const actionSocialeFormacode = {
  formacode: {
    connectOrCreate: {
      where: { code_version: { code: "440", version: "v14" } },
      create: {
        code: "440",
        version: "v14",
        label: "Action sociale",
        type: FormacodeType.SUB_DOMAIN,
      },
    },
  },
};

const degreeOne = {
  degree: {
    connect: {
      code: "N1_SANS",
    },
  },
};

const submitTraining = async ({
  candidacy,
  organism,
}: {
  candidacy: { id: string };
  organism: { accounts: { keycloakId: string }[] };
}) => {
  const organismKeycloakId = organism?.accounts[0].keycloakId ?? "";
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: organismKeycloakId,
      }),
    },
  });

  const training_submitTrainingForm = graphql(`
    mutation training_submitTrainingForm(
      $candidacyId: UUID!
      $training: TrainingInput!
    ) {
      training_submitTrainingForm(
        candidacyId: $candidacyId
        training: $training
      ) {
        id
        status
      }
    }
  `);

  return graphqlClient.request(training_submitTrainingForm, {
    candidacyId: candidacy.id,
    training: TRAINING_INPUT,
  });
};

const confirmTraining = async ({
  candidacy,
}: {
  candidacy: { id: string; candidate: { keycloakId: string } | null };
}) => {
  const candidateKeycloakId = candidacy?.candidate?.keycloakId ?? "";
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "candidate",
        keycloakId: candidateKeycloakId,
      }),
    },
  });

  const training_confirmTrainingForm = graphql(`
    mutation training_confirmTrainingForm($candidacyId: UUID!) {
      training_confirmTrainingForm(candidacyId: $candidacyId) {
        id
        status
      }
    }
  `);

  return graphqlClient.request(training_confirmTrainingForm, {
    candidacyId: candidacy?.id ?? "",
  });
};

const updateCertificationWithinScope = async ({
  certification,
  candidacy,
  organism,
}: {
  certification: { id: string };
  candidacy: { id: string };
  organism: { accounts: { keycloakId: string }[] };
}) => {
  const organismKeycloakId = organism.accounts[0].keycloakId ?? "";

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: organismKeycloakId,
      }),
    },
  });

  const candidacy_certification_updateCertificationWithinOrganismScope =
    graphql(`
      mutation candidacy_certification_updateCertificationWithinOrganismScope(
        $candidacyId: ID!
        $certificationId: ID!
      ) {
        candidacy_certification_updateCertificationWithinOrganismScope(
          candidacyId: $candidacyId
          certificationId: $certificationId
        )
      }
    `);

  return graphqlClient.request(
    candidacy_certification_updateCertificationWithinOrganismScope,
    {
      candidacyId: candidacy?.id,
      certificationId: certification.id,
    },
  );
};

const createOrganismSocial = async () => {
  return createOrganismHelper({
    typology: OrganismTypology.expertFiliere,
    organismOnFormacode: {
      create: actionSocialeFormacode,
    },
    managedDegrees: {
      create: degreeOne,
    },
  });
};

const createCertificationSocial = async () => {
  return createCertificationHelper({
    certificationOnFormacode: {
      create: actionSocialeFormacode,
    },
  });
};

const createCandidacyWithSocialCertificationAndOrganism = async ({
  statut,
}: {
  statut: CandidacyStatusStep;
}) => {
  const certification = await createCertificationSocial();
  const organism = await createOrganismSocial();
  const candidacy = await createCandidacyHelper({
    candidacyArgs: {
      organismId: organism.id,
    },
    candidacyActiveStatus: statut,
  });

  return { candidacy, certification, organism };
};

const allowedStatuses: CandidacyStatusStep[] = [
  "PROJET",
  "VALIDATION",
  "PRISE_EN_CHARGE",
  "PARCOURS_ENVOYE",
  "PARCOURS_CONFIRME",
  "DOSSIER_FAISABILITE_INCOMPLET",
];

const notAllowedStatuses: CandidacyStatusStep[] = [
  "DOSSIER_FAISABILITE_ENVOYE",
  "DOSSIER_FAISABILITE_RECEVABLE",
  "DOSSIER_FAISABILITE_NON_RECEVABLE",
  "DOSSIER_FAISABILITE_COMPLET",
  "DOSSIER_DE_VALIDATION_ENVOYE",
  "DOSSIER_DE_VALIDATION_SIGNALE",
];

allowedStatuses.forEach((statut) => {
  test(`should allow certification update when candidacy status is ${statut}`, async () => {
    const { candidacy, organism } =
      await createCandidacyWithSocialCertificationAndOrganism({ statut });

    const newCertification = await createCertificationSocial();

    await updateCertificationWithinScope({
      certification: newCertification,
      candidacy,
      organism,
    });

    const candidacyUpdated = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });

    expect(candidacyUpdated?.certificationId).toEqual(newCertification.id);
    expect(candidacyUpdated?.status).toEqual("PRISE_EN_CHARGE");
  });
});

test("should allow admin to update certification when status is DOSSIER_FAISABILITE_INCOMPLET and MULTI_CANDIDACY is active", async () => {
  await createFeatureHelper({
    args: {
      key: "MULTI_CANDIDACY",
      label: "Multi candidacy",
      isActive: true,
    },
  });

  const { candidacy, organism } =
    await createCandidacyWithSocialCertificationAndOrganism({
      statut: CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
    });

  const newCertification = await createCertificationSocial();
  const organismKeycloakId = organism.accounts[0].keycloakId ?? "";

  const adminGraphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: organismKeycloakId,
      }),
    },
  });

  const candidacy_certification_updateCertificationWithinOrganismScope =
    graphql(`
      mutation candidacy_certification_updateCertificationWithinOrganismScope(
        $candidacyId: ID!
        $certificationId: ID!
      ) {
        candidacy_certification_updateCertificationWithinOrganismScope(
          candidacyId: $candidacyId
          certificationId: $certificationId
        )
      }
    `);

  await adminGraphqlClient.request(
    candidacy_certification_updateCertificationWithinOrganismScope,
    {
      candidacyId: candidacy.id,
      certificationId: newCertification.id,
    },
  );

  const candidacyUpdated = await prismaClient.candidacy.findUnique({
    where: { id: candidacy.id },
  });

  expect(candidacyUpdated?.certificationId).toEqual(newCertification.id);
});

test("should block non-admin from updating certification when status is DOSSIER_FAISABILITE_INCOMPLET and MULTI_CANDIDACY is active", async () => {
  await createFeatureHelper({
    args: {
      key: "MULTI_CANDIDACY",
      label: "Multi candidacy",
      isActive: true,
    },
  });

  const { candidacy, organism } =
    await createCandidacyWithSocialCertificationAndOrganism({
      statut: CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
    });

  const newCertification = await createCertificationSocial();

  await expect(
    updateCertificationWithinScope({
      certification: newCertification,
      candidacy,
      organism,
    }),
  ).rejects.toThrowError(
    "Impossible de modifier la certification lorsque le dossier de faisabilité est incomplet",
  );
});

test("an organism should be able to update certification while a training is sent", async () => {
  const { candidacy, organism } =
    await createCandidacyWithSocialCertificationAndOrganism({
      statut: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

  const newCertification = await createCertificationSocial();

  await submitTraining({ candidacy, organism });
  await updateCertificationWithinScope({
    certification: newCertification,
    candidacy,
    organism,
  });

  const candidacyUpdated = await prismaClient.candidacy.findUnique({
    where: { id: candidacy.id },
  });

  expect(candidacyUpdated?.certificationId).toEqual(newCertification.id);
});

test("should update certification after the training is confirmed", async () => {
  const { candidacy, organism } =
    await createCandidacyWithSocialCertificationAndOrganism({
      statut: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

  const newSocialCertification = await createCertificationSocial();

  await submitTraining({ candidacy, organism });
  await confirmTraining({ candidacy });
  await updateCertificationWithinScope({
    certification: newSocialCertification,
    candidacy,
    organism,
  });

  const candidacyUpdated = await prismaClient.candidacy.findUnique({
    where: { id: candidacy.id },
  });

  expect(candidacyUpdated?.certificationId).toEqual(newSocialCertification.id);
});

test("should not be able to update certification that is not in its scope", async () => {
  const { candidacy, organism } =
    await createCandidacyWithSocialCertificationAndOrganism({
      statut: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

  const newRandomCertification = await createCertificationHelper();

  await submitTraining({ candidacy, organism });
  await expect(
    updateCertificationWithinScope({
      certification: newRandomCertification,
      candidacy,
      organism,
    }),
  ).rejects.toThrowError(
    "Cette certification n'est pas disponible pour cet organisme",
  );
});

notAllowedStatuses.forEach((statut) => {
  test(`should not be able to update certification when candidacy status is ${statut}`, async () => {
    const { candidacy, organism } =
      await createCandidacyWithSocialCertificationAndOrganism({ statut });

    const newSocialCertification = await createCertificationSocial();

    await expect(
      updateCertificationWithinScope({
        certification: newSocialCertification,
        candidacy,
        organism,
      }),
    ).rejects.toThrowError(
      "La certification ne peut être mise à jour qu'en début de candidature",
    );
  });
});

test("should reset the status, keeping the training, after certification update", async () => {
  const { candidacy, organism } =
    await createCandidacyWithSocialCertificationAndOrganism({
      statut: CandidacyStatusStep.PRISE_EN_CHARGE,
    });

  const newSocialCertification = await createCertificationSocial();

  const candidacyId = candidacy.id;

  await submitTraining({ candidacy, organism });
  await updateCertificationWithinScope({
    certification: newSocialCertification,
    candidacy,
    organism,
  });

  const candidacyUpdated = await prismaClient.candidacy.findUnique({
    where: { id: candidacyId },
  });

  expect(candidacyUpdated).toMatchObject({
    status: CandidacyStatusStep.PRISE_EN_CHARGE,
    certificateSkills: TRAINING_INPUT.certificateSkills,
    otherTraining: TRAINING_INPUT.otherTraining,
    individualHourCount: TRAINING_INPUT.individualHourCount,
    collectiveHourCount: TRAINING_INPUT.collectiveHourCount,
    additionalHourCount: TRAINING_INPUT.additionalHourCount,
    isCertificationPartial: TRAINING_INPUT.isCertificationPartial,
  });
});
