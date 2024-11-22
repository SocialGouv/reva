/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { prismaClient } from "../../../../prisma/client";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";

import { CandidacyStatusStep, OrganismTypology } from "@prisma/client";
import { TRAINING_INPUT } from "../../../../test/fixtures";
import { createCandidacyHelper } from "../../../../test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "../../../../test/helpers/entities/create-certification-helper";
import { clearDatabase } from "../../../../test/jestClearDatabaseBeforeEachTestFile";
import { createOrganismHelper } from "../../../../test/helpers/entities/create-organism-helper";
import { FormacodeType } from ".prisma/client";

const submitTraining = async ({
  candidacy,
  organism,
}: {
  candidacy: { id: string };
  organism: { accounts: { keycloakId: string }[] };
}) => {
  const organismKeycloakId = organism?.accounts[0].keycloakId ?? "";
  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_submitTrainingForm",
      arguments: {
        candidacyId: candidacy.id,
        training: TRAINING_INPUT,
      },
      returnFields: "{id,status}",
    },
  });
};

const confirmTraining = async ({
  candidacy,
  organism,
}: {
  candidacy: { id: string };
  organism: { accounts: { keycloakId: string }[] };
}) => {
  const organismKeycloakId = organism.accounts[0].keycloakId ?? "";
  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "candidate",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "training_confirmTrainingForm",
      arguments: {
        candidacyId: candidacy?.id ?? "",
      },
      returnFields: "{id, status}",
    },
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

  return await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint:
        "candidacy_certification_updateCertificationWithinOrganismScope",
      arguments: {
        candidacyId: candidacy?.id,
        certificationId: certification.id,
      },
      returnFields: "",
    },
  });
};

const actionSocialeFormacode = {
  formacode: {
    connectOrCreate: {
      where: { code: "440" },
      create: {
        code: "440",
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

const createOrganismSocial = async () => {
  return await createOrganismHelper({
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
  return await createCertificationHelper({
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

afterEach(async () => {
  await clearDatabase();
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
  await confirmTraining({ candidacy, organism });
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
  const resp = await updateCertificationWithinScope({
    certification: newRandomCertification,
    candidacy,
    organism,
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "Cette certification n'est pas disponible pour cet organisme",
  );
});

test("should not be able to update certification after feasibility sent", async () => {
  const { candidacy, organism } =
    await createCandidacyWithSocialCertificationAndOrganism({
      statut: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
    });

  const newSocialCertification = await createCertificationSocial();

  await submitTraining({ candidacy, organism });
  const resp = await updateCertificationWithinScope({
    certification: newSocialCertification,
    candidacy,
    organism,
  });

  expect(resp.statusCode).toEqual(200);
  expect(resp.json().errors?.[0].message).toEqual(
    "La certification ne peut être mise à jour qu'en début de candidature",
  );
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
