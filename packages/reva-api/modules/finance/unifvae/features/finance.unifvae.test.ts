import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import {
  CANDIDACY_DROP_OUT_FOUR_MONTHS_AGO,
  CANDIDACY_DROP_OUT_FOUR_MONTHS_AGO_MINUS_FIVE_MINUTES,
} from "@/test/fixtures/candidacies.fixture";
import { PAYMENT_REQUEST } from "@/test/fixtures/payment-requests.fixture";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { createFundingRequestUnifvaeHelper } from "@/test/helpers/entities/create-funding-request-unifvae-helper";
import { injectGraphql } from "@/test/helpers/graphql-helper";

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
    fastify: global.testApp,
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

const dropOutCandidacyFourMonthsAgoMinusOneMinute = async ({
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
          ...CANDIDACY_DROP_OUT_FOUR_MONTHS_AGO_MINUS_FIVE_MINUTES,
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

describe("Unifvae ayment request", () => {
  test("should fail to create paymentRequestUnifvae when candidacy was drop out less than 4 months ago then succeed after 4 months", async () => {
    const candidacyInput = await createCandidacyHelper({
      candidacyArgs: {
        financeModule: "unifvae",
      },
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
    });
    const feasibility = await createFeasibilityUploadedPdfHelper({
      feasibilityFileSentAt: new Date(),
      candidacyId: candidacyInput.id,
    });
    const candidacy = feasibility.candidacy;
    const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

    await createFundingRequestUnifvaeHelper({
      candidacyId: candidacy.id,
      createdAt: new Date("2022-06-02T00:00:00.000Z"),
    });

    await dropOutCandidacyFourMonthsAgoMinusOneMinute({
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
          update: CANDIDACY_DROP_OUT_FOUR_MONTHS_AGO,
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
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
    });
    const feasibility = await createFeasibilityUploadedPdfHelper({
      feasibilityFileSentAt: new Date(),
      candidacyId: candidacyInput.id,
    });
    const candidacy = feasibility.candidacy;
    const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

    await createFundingRequestUnifvaeHelper({
      candidacyId: candidacy.id,
      createdAt: new Date("2022-06-02T00:00:00.000Z"),
    });

    await dropOutCandidacyFourMonthsAgoMinusOneMinute({
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
      candidacyActiveStatus: CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
    });
    const feasibility = await createFeasibilityUploadedPdfHelper({
      feasibilityFileSentAt: new Date(),
      candidacyId: candidacyInput.id,
    });
    const candidacy = feasibility.candidacy;
    const organismKeycloakId = candidacy.organism?.accounts[0].keycloakId ?? "";

    await createFundingRequestUnifvaeHelper({
      candidacyId: candidacy.id,
      createdAt: new Date("2022-06-02T00:00:00.000Z"),
    });

    await dropOutCandidacyFourMonthsAgoMinusOneMinute({
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

    await createFundingRequestUnifvaeHelper({
      candidacyId: candidacy.id,
      createdAt: new Date("2024-06-02T00:00:00.000Z"),
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

    await createFundingRequestUnifvaeHelper({
      candidacyId: candidacy.id,
      createdAt: new Date("2024-06-01T00:00:00.000Z"),
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
      const organismKeycloakId =
        candidacy.organism?.accounts[0].keycloakId ?? "";

      await createFundingRequestUnifvaeHelper({
        candidacyId: candidacy.id,
        createdAt: new Date("2024-06-02T00:00:00.000Z"),
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
      const organismKeycloakId =
        candidacy.organism?.accounts[0].keycloakId ?? "";

      await createFundingRequestUnifvaeHelper({
        candidacyId: candidacy.id,
        createdAt: new Date("2024-06-01T00:00:00.000Z"),
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
});
