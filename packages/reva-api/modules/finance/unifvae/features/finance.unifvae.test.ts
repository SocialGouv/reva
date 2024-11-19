/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";

import {
  CANDIDACY_DROP_OUT_SIX_MONTHS_AGO,
  CANDIDACY_DROP_OUT_SIX_MONTHS_AGO_MINUS_ONE_MINUTE,
  FUNDING_REQUEST_SAMPLE,
  FUNDING_REQUEST_SAMPLE_FORMATTED_OUTPUT,
  PAYMENT_REQUEST,
} from "../../../../test/fixtures";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { createCandidateHelper } from "../../../../test/helpers/entities/create-candidate-helper";
import { createCertificationHelper } from "../../../../test/helpers/entities/create-certification-helper";
import { createFeasibilityUploadedPdfHelper } from "../../../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import { clearDatabase } from "../../../../test/jestClearDatabaseBeforeEachTestFile";

afterEach(async () => {
  await clearDatabase();
});

const injectGraphqlPaymentRequestCreation = async ({
  keycloakId,
  candidacyId,
}: {
  keycloakId: string;
  candidacyId: string;
}) =>
  injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createOrUpdatePaymentRequestUnifvae",
      returnFields: "{ id }",
      arguments: {
        candidacyId,
        paymentRequest: {
          ...PAYMENT_REQUEST,
        },
      },
    },
  });

const dropOutCandidacySixMonthsAgoMinusOneMinute = async ({
  proofReceivedByAdmin,
  candidacyId,
}: {
  proofReceivedByAdmin: boolean;
  candidacyId: string;
}) =>
  prismaClient.candidacy.update({
    where: { id: candidacyId },
    data: {
      candidacyDropOut: {
        create: {
          ...CANDIDACY_DROP_OUT_SIX_MONTHS_AGO_MINUS_ONE_MINUTE,
          dropOutReason: { connect: { label: "Autre" } },
          proofReceivedByAdmin,
        },
      },
    },
    include: {
      candidacyDropOut: true,
    },
  });

test("should create fundingRequestUnifvae with matching batch", async () => {
  const candidate = await createCandidateHelper({
    firstname: FUNDING_REQUEST_SAMPLE.fundingContactFirstname,
    firstname2: FUNDING_REQUEST_SAMPLE.candidateSecondname,
    firstname3: FUNDING_REQUEST_SAMPLE.candidateThirdname,
    lastname: FUNDING_REQUEST_SAMPLE.fundingContactLastname,
    email: FUNDING_REQUEST_SAMPLE.fundingContactEmail,
    phone: FUNDING_REQUEST_SAMPLE.fundingContactPhone,
    gender: FUNDING_REQUEST_SAMPLE.candidateGender,
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityArgs: {
      feasibilityFileSentAt: new Date(),
    },
    candidacyArgs: {
      candidateId: candidate.id,
    },
  });
  const candidacy = feasibility.candidacy;
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount, fundingContactFirstname, fundingContactLastname, fundingContactEmail, fundingContactPhone }",
      arguments: {
        candidacyId: candidacy.id,
        fundingRequest: FUNDING_REQUEST_SAMPLE,
      },
      enumFields: ["candidateGender"],
    },
  });
  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).not.toHaveProperty("errors");
  // Check resulting object
  expect(obj).toMatchObject({
    data: {
      candidacy_createFundingRequestUnifvae: FUNDING_REQUEST_SAMPLE,
    },
  });

  // Check candidacy status
  const status = await prismaClient.candidaciesStatus.findFirst({
    where: { candidacyId: candidacy.id, isActive: true },
  });
  expect(status?.status).toBe(CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE);

  // Check batch
  const myFundReqBatch =
    await prismaClient.fundingRequestBatchUnifvae.findFirst({
      where: { fundingRequestId: obj.data.id },
    });

  expect(myFundReqBatch).toMatchObject({
    sent: false,
    content: {
      ...FUNDING_REQUEST_SAMPLE_FORMATTED_OUTPUT,
      NumAction: expect.any(String),
      SiretAP: candidacy.organism?.siret,
    },
  });
});

test("Should fail to create fundingRequestUnifvae when candidacy is not bound to Unifvae finance module", async () => {
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityArgs: {
      feasibilityFileSentAt: new Date(),
    },
    candidacyArgs: {
      financeModule: "unireva",
    },
  });
  const candidacy = feasibility.candidacy;
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount }",
      arguments: {
        candidacyId: candidacy.id,
        fundingRequest: FUNDING_REQUEST_SAMPLE,
      },
      enumFields: ["candidateGender"],
    },
  });
  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    'Cannot create FundingRequestUnifvae: candidacy.financeModule is "unireva"',
  );
});

test("should fail to create a fundingRequestUnifvae whith a 'hors care' candidacy certification", async () => {
  const certification = await createCertificationHelper({ rncpId: "000000" });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
    feasibilityArgs: {
      feasibilityFileSentAt: new Date(),
    },
  });
  const candidacy = feasibility.candidacy;

  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId;
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: organismKeycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount, fundingContactFirstname, fundingContactLastname, fundingContactEmail, fundingContactPhone }",
      arguments: {
        candidacyId: candidacy.id,
        fundingRequest: {
          ...FUNDING_REQUEST_SAMPLE,
        },
      },
      enumFields: ["candidateGender"],
    },
  });
  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    "La demande de financement n'est pas autorisée pour cette certification",
  );
});

test("should fail to create paymentRequestUnifvae when candidacy was drop out less than 6 months ago then succeed after 6 months", async () => {
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityArgs: {
      feasibilityFileSentAt: new Date(),
    },
    candidacyActiveStatus: CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE,
  });
  const candidacy = feasibility.candidacy;
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

  await dropOutCandidacySixMonthsAgoMinusOneMinute({
    proofReceivedByAdmin: false,
    candidacyId: candidacy.id,
  });

  const resp = await injectGraphqlPaymentRequestCreation({
    keycloakId: organismKeycloakId,
    candidacyId: candidacy.id,
  });

  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    "La demande de paiement n’est pas encore disponible. Vous y aurez accès 6 mois après la mise en abandon du candidat.",
  );

  await prismaClient.candidacy.update({
    where: { id: candidacy.id },
    data: {
      candidacyDropOut: {
        update: CANDIDACY_DROP_OUT_SIX_MONTHS_AGO,
      },
    },
  });

  const resp2 = await injectGraphqlPaymentRequestCreation({
    keycloakId: organismKeycloakId,
    candidacyId: candidacy.id,
  });

  const obj2 = resp2.json();
  expect(obj2).not.toHaveProperty("errors");
});

test("should allow the creation of paymentRequestUnifvae when candidacy was drop out less than 6 months ago but the proof was received by an admin", async () => {
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityArgs: {
      feasibilityFileSentAt: new Date(),
    },
    candidacyActiveStatus: CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE,
  });
  const candidacy = feasibility.candidacy;
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

  await dropOutCandidacySixMonthsAgoMinusOneMinute({
    proofReceivedByAdmin: true,
    candidacyId: candidacy.id,
  });

  const resp = await injectGraphqlPaymentRequestCreation({
    keycloakId: organismKeycloakId,
    candidacyId: candidacy.id,
  });
  const obj = resp.json();
  expect(obj).not.toHaveProperty("errors");
});
