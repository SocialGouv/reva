/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import {
  Account,
  Candidacy,
  CandidacyStatusStep,
  Organism,
} from "@prisma/client";

import { organismDummy1 } from "../../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { prismaClient } from "../../../database/postgres/client";

const fundingRequestSample = {
  candidateFirstname: "Jojo",
  candidateSecondname: "Lapin",
  candidateLastname: "De Garenne",
  candidateGender: "man",
  isPartialCertification: false,
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
const aapEmail = "aap@formation.com";
const aapKeycloakId = "e4965f17-6c39-4ed2-8786-e504e320e476";

let organism: Organism,
  candidacyUnireva: Candidacy,
  candidacyUnifvae: Candidacy,
  aapAccount: Account;

beforeAll(async () => {
  organism = await prismaClient.organism.create({ data: organismDummy1 });
  aapAccount = await prismaClient.account.create({
    data: {
      email: aapEmail,
      keycloakId: aapKeycloakId,
      organismId: organism.id,
    },
  });
  candidacyUnifvae = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateEmail,
      email: candidateEmail,
      organismId: organism.id,
      financeModule: "unifvae",
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
  candidacyUnireva = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateEmail,
      email: candidateEmail,
      organismId: organism.id,
      financeModule: "unireva",
    },
  });
});

afterAll(async () => {
  await prismaClient.trainingOnFundingRequestsUnifvae.deleteMany({});
  await prismaClient.basicSkillOnFundingRequestsUnifvae.deleteMany({});
  await prismaClient.fundingRequestUnifvae.deleteMany({});
  await prismaClient.candidaciesStatus.deleteMany({
    where: { candidacyId: candidacyUnifvae.id },
  });
  await prismaClient.candidacy.deleteMany({
    where: { id: { in: [candidacyUnifvae.id, candidacyUnireva.id] } },
  });
  await prismaClient.organism.delete({ where: { id: organism.id } });
  await prismaClient.account.delete({ where: { id: aapAccount.id } });
});

test("should create fundingRequestUnifvae", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount }",
      arguments: {
        candidacyId: candidacyUnifvae.id,
        fundingRequest: {
          ...fundingRequestSample,
          companionId: organism.id,
        },
      },
      enumFields: ["candidateGender"],
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
    where: { candidacyId: candidacyUnifvae.id, isActive: true },
  });
  expect(status?.status).toBe(CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE);
});

test("Should fail when candidacy is not bound to UnifVae finance module", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id,candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount }",
      arguments: {
        candidacyId: candidacyUnireva.id,
        fundingRequest: {
          ...fundingRequestSample,
          companionId: organism.id,
        },
      },
      enumFields: ["candidateGender"],
    },
  });
  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    'Cannot create FundingRequestUnifvae: candidacy.financeModule is "unireva"'
  );
});
