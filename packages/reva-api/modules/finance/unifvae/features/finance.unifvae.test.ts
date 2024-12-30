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
import { createCandidacyHelper } from "../../../../test/helpers/entities/create-candidacy-helper";
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
  paymentRequestOverride,
}: {
  keycloakId: string;
  candidacyId: string;
  paymentRequestOverride?: Partial<typeof PAYMENT_REQUEST>;
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
          ...paymentRequestOverride,
        },
      },
    },
  });

const dropOutCandidacySixMonthsAgoMinusOneMinute = async ({
  proofReceivedByAdmin,
  dropOutConfirmedByCandidate,
  candidacyId,
}: {
  proofReceivedByAdmin?: boolean;
  dropOutConfirmedByCandidate?: boolean;
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
          dropOutConfirmedByCandidate,
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
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      candidateId: candidate.id,
    },
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityFileSentAt: new Date(),
    candidacyId: candidacyInput.id,
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
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      financeModule: "unireva",
    },
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityFileSentAt: new Date(),
    candidacyId: candidacyInput.id,
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
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      certificationId: certification.id,
    },
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    candidacyId: candidacyInput.id,
    feasibilityFileSentAt: new Date(),
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
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      financeModule: "unifvae",
    },
    candidacyActiveStatus: CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE,
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityFileSentAt: new Date(),
    candidacyId: candidacyInput.id,
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
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      financeModule: "unifvae",
    },
    candidacyActiveStatus: CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE,
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityFileSentAt: new Date(),
    candidacyId: candidacyInput.id,
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

test("should allow the creation of paymentRequestUnifvae when candidacy was drop out less than 6 months ago but the candidate has confirmed his dropout", async () => {
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      financeModule: "unifvae",
    },
    candidacyActiveStatus: CandidacyStatusStep.DEMANDE_FINANCEMENT_ENVOYE,
  });
  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityFileSentAt: new Date(),
    candidacyId: candidacyInput.id,
  });
  const candidacy = feasibility.candidacy;
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

  await dropOutCandidacySixMonthsAgoMinusOneMinute({
    dropOutConfirmedByCandidate: true,
    candidacyId: candidacy.id,
  });

  const resp = await injectGraphqlPaymentRequestCreation({
    keycloakId: organismKeycloakId,
    candidacyId: candidacy.id,
  });
  const obj = resp.json();
  expect(obj).not.toHaveProperty("errors");
});

test("should reject a payment request of more than 3200€ when the funding request has been sent the 02/06/2024", async () => {
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      financeModule: "unifvae",
    },
    candidacyActiveStatus: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityFileSentAt: new Date(),
    decision: "ADMISSIBLE",
    candidacyId: candidacyInput.id,
  });
  const candidacy = feasibility.candidacy;
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

  await prismaClient.candidaciesStatus.create({
    data: {
      candidacyId: candidacy.id,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
      createdAt: "2024-06-02T00:00:00.000Z",
    },
  });

  const resp = await injectGraphqlPaymentRequestCreation({
    keycloakId: organismKeycloakId,
    candidacyId: candidacy.id,
    paymentRequestOverride: {
      basicSkillsEffectiveHourCount: 70,
      basicSkillsEffectiveCost: 25,
      individualEffectiveCost: 70,
      individualEffectiveHourCount: 30,
    },
  });

  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    "Le coût total de la demande ne peut dépasser 3200€ hors forfait",
  );
});

test("should reject a payment request of more than 3200€ when the funding request has been sent before the 02/06/2024 and the certification is neither DEAS, DEAP or DEAES", async () => {
  const candidacyInput = await createCandidacyHelper({
    candidacyArgs: {
      financeModule: "unifvae",
    },
    candidacyActiveStatus: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
  });

  const feasibility = await createFeasibilityUploadedPdfHelper({
    feasibilityFileSentAt: new Date(),
    decision: "ADMISSIBLE",
    candidacyId: candidacyInput.id,
  });
  const candidacy = feasibility.candidacy;
  const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

  await prismaClient.candidaciesStatus.create({
    data: {
      candidacyId: candidacy.id,
      status: "DEMANDE_FINANCEMENT_ENVOYE",
      createdAt: "2024-06-01T00:00:00.000Z",
    },
  });

  const resp = await injectGraphqlPaymentRequestCreation({
    keycloakId: organismKeycloakId,
    candidacyId: candidacy.id,
    paymentRequestOverride: {
      basicSkillsEffectiveHourCount: 70,
      basicSkillsEffectiveCost: 25,
      individualEffectiveCost: 70,
      individualEffectiveHourCount: 30,
    },
  });

  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    "Le coût total de la demande ne peut dépasser 3200€ hors forfait",
  );
});

test.each([
  ["DEAS", "4495"],
  ["DEAS", "35830"],
  ["DEAP", "4496"],
  ["DEAP", "35832"],
  ["DEAES", "25467"],
  ["DEAES", "36004"],
])(
  "should reject a payment request of more than 3200€ when the funding request has been sent the 02/06/2024 and the certification %s with rncp %s",
  async () => {
    const cert = await createCertificationHelper({ rncpId: "4495" });

    if (!cert) {
      throw new Error("Certification DEAS not found");
    }

    const candidacyInput = await createCandidacyHelper({
      candidacyArgs: {
        financeModule: "unifvae",
        certificationId: cert.id,
      },
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
    });

    const feasibility = await createFeasibilityUploadedPdfHelper({
      feasibilityFileSentAt: new Date(),
      decision: "ADMISSIBLE",
      candidacyId: candidacyInput.id,
    });
    const candidacy = feasibility.candidacy;
    const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

    await prismaClient.candidaciesStatus.create({
      data: {
        candidacyId: candidacy.id,
        status: "DEMANDE_FINANCEMENT_ENVOYE",
        createdAt: "2024-06-02T00:00:00.000Z",
      },
    });

    const resp = await injectGraphqlPaymentRequestCreation({
      keycloakId: organismKeycloakId,
      candidacyId: candidacy.id,
      paymentRequestOverride: {
        basicSkillsEffectiveHourCount: 70,
        basicSkillsEffectiveCost: 25,
        individualEffectiveCost: 70,
        individualEffectiveHourCount: 30,
      },
    });

    const obj = resp.json();
    expect(obj).toHaveProperty("errors");
    expect(obj.errors[0].message).toBe(
      "Le coût total de la demande ne peut dépasser 3200€ hors forfait",
    );
  },
);

test.each([
  ["DEAS", "4495"],
  ["DEAS", "35830"],
  ["DEAP", "4496"],
  ["DEAP", "35832"],
  ["DEAES", "25467"],
  ["DEAES", "36004"],
])(
  "should accept a payment request of more than 3200€ when the funding request has been sent before the 02/06/2024 and the certification is %s with rncp %s",
  async () => {
    const cert = await createCertificationHelper({ rncpId: "4495" });

    if (!cert) {
      throw new Error("Certification DEAS not found");
    }
    const candidacyInput = await createCandidacyHelper({
      candidacyArgs: {
        financeModule: "unifvae",
        certificationId: cert.id,
      },
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
    });

    const feasibility = await createFeasibilityUploadedPdfHelper({
      feasibilityFileSentAt: new Date(),
      decision: "ADMISSIBLE",
      candidacyId: candidacyInput.id,
    });
    const candidacy = feasibility.candidacy;
    const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

    await prismaClient.candidaciesStatus.create({
      data: {
        candidacyId: candidacy.id,
        status: "DEMANDE_FINANCEMENT_ENVOYE",
        createdAt: "2024-06-01T00:00:00.000Z",
      },
    });

    const resp = await injectGraphqlPaymentRequestCreation({
      keycloakId: organismKeycloakId,
      candidacyId: candidacy.id,
      paymentRequestOverride: {
        basicSkillsEffectiveHourCount: 70,
        basicSkillsEffectiveCost: 25,
        individualEffectiveCost: 70,
        individualEffectiveHourCount: 30,
      },
    });

    const obj = resp.json();
    expect(obj).not.toHaveProperty("errors");
  },
);
