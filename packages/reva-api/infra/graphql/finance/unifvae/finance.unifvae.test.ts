/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { Candidacy, CandidacyStatusStep, Organism } from "@prisma/client";

import { organismDummy1 } from "../../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";

const fundingRequestSample = {
  basicSkillsCost: 123,
  basicSkillsHourCount: 213,
  certificateSkillsCost: 213,
  certificateSkillsHourCount: 213,
  collectiveCost: 213,
  collectiveHourCount: 213,
  individualCost: 213,
  individualHourCount: 213,
  mandatoryTrainingsCost: 213,
  mandatoryTrainingsHourCount: 213,
  otherTrainingCost: 213,
  otherTrainingHourCount: 213,
};

const candidateEmail = "toto@bongo.eu";

let organism: Organism, candidacy: Candidacy;

beforeAll(async () => {
  organism = await prismaClient.organism.create({ data: organismDummy1 });
  candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateEmail,
      email: candidateEmail,
      organismId: organism.id,
      candidacyStatuses: {
        createMany: {
          data: [
            {
              isActive: true,
              status: CandidacyStatusStep.PARCOURS_CONFIRME,
            },
          ],
        },
      },
    },
  });
});

afterAll(async () => {
  await prismaClient.trainingOnFundingRequestsUnifvae.deleteMany({});
  await prismaClient.basicSkillOnFundingRequestsUnifvae.deleteMany({});
  await prismaClient.fundingRequestUnifvae.deleteMany({});
  await prismaClient.candidaciesStatus.deleteMany({});
  await prismaClient.candidacy.deleteMany({});
  await prismaClient.organism.deleteMany({});
});

test("should create fundingRequestUnifvae", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount }",
      arguments: {
        candidacyId: candidacy.id,
        fundingRequest: {
          ...fundingRequestSample,
          companionId: organism.id,
        },
      },
    },
  });
  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).not.toHaveProperty("errors");
  // Check
  expect(obj).toMatchObject({
    data: {
      candidacy_createFundingRequestUnifvae: {
        ...fundingRequestSample,
      },
    },
  });
  // Check candidacy status
  const status = await prismaClient.candidaciesStatus.findFirst({
    where: { candidacyId: candidacy.id, isActive: true },
  });
  expect(status?.status).toBe(CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE);
});
