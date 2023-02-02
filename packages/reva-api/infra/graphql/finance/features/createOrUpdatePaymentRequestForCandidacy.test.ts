import { Left, Maybe, Right } from "purify-ts";

import { PaymentRequest } from "../../../../domain/types/candidacy";
import { FundingRequest } from "../../../../domain/types/candidate";
import { createOrUpdatePaymentRequestForCandidacy } from "./createOrUpdatePaymentRequestForCandidacy";

const defaultValidPaymentRequest: PaymentRequest = {
  id: "1234",
  basicSkillsEffectiveHourCount: 1,
  certificateSkillsEffectiveHourCount: 2,
  collectiveEffectiveHourCount: 3,
  diagnosisEffectiveHourCount: 4,
  examEffectiveHourCount: 5,
  individualEffectiveHourCount: 6,
  mandatoryTrainingsEffectiveHourCount: 7,
  postExamEffectiveHourCount: 8,
};

const defaultValidFundingRequest: FundingRequest = {
  id: "5678",
  basicSkillsHourCount: 1,
  certificateSkillsHourCount: 2,
  collectiveHourCount: 3,
  diagnosisHourCount: 4,
  examHourCount: 5,
  individualHourCount: 6,
  mandatoryTrainingsHourCount: 7,
  postExamHourCount: 8,
} as FundingRequest;

describe("create or update payment request", () => {
  describe("create or update payment request", () => {
    test("should create a new valid payment request", async () => {
      const cpr = createOrUpdatePaymentRequestForCandidacy({
        createPaymentRequest: (params: {
          candidacyId: string;
          paymentRequest: PaymentRequest;
        }) => Promise.resolve(Right(params.paymentRequest)),

        hasRole: () => true,
        getPaymentRequestByCandidacyId: () =>
          Promise.resolve(Right(Maybe.empty())),
        getFundingRequestByCandidacyId: () =>
          Promise.resolve(Right(defaultValidFundingRequest)),

        updatePaymentRequest: () =>
          Promise.resolve(Left("Test should not run update method")),
      });
      const result = await cpr({
        candidacyId: "1234",
        paymentRequest: defaultValidPaymentRequest,
      });
      expect(result.isRight()).toEqual(true);
    });
  });
  test("should update an existing valid payment request", async () => {
    const cpr = createOrUpdatePaymentRequestForCandidacy({
      createPaymentRequest: () =>
        Promise.resolve(Left("Test should not run create method")),
      hasRole: () => true,
      getPaymentRequestByCandidacyId: () =>
        Promise.resolve(Right(Maybe.of(defaultValidPaymentRequest))),
      getFundingRequestByCandidacyId: () =>
        Promise.resolve(Right(defaultValidFundingRequest)),

      updatePaymentRequest: (params: { paymentRequest: PaymentRequest }) =>
        Promise.resolve(Right(params.paymentRequest)),
    });
    const result = await cpr({
      candidacyId: "1234",
      paymentRequest: defaultValidPaymentRequest,
    });
    expect(result.isRight()).toEqual(true);
  });
  test("should fail to create a new payment request with hour count greater than matching funding request", async () => {
    const cpr = createOrUpdatePaymentRequestForCandidacy({
      createPaymentRequest: (params: {
        candidacyId: string;
        paymentRequest: PaymentRequest;
      }) => Promise.resolve(Right(params.paymentRequest)),

      hasRole: () => true,
      getPaymentRequestByCandidacyId: () =>
        Promise.resolve(Right(Maybe.empty())),
      getFundingRequestByCandidacyId: () =>
        Promise.resolve(Right(defaultValidFundingRequest)),

      updatePaymentRequest: () =>
        Promise.resolve(Left("Test should not run update method")),
    });
    const result = await cpr({
      candidacyId: "1234",
      paymentRequest: {
        ...defaultValidPaymentRequest,
        individualEffectiveHourCount: 12,
      },
    });
    expect(result.isLeft()).toEqual(true);
    expect(result.extract()).toMatchObject({
      code: "FUNDING_REQUEST_NOT_POSSIBLE",
      message: "Une erreur est survenue lors de la validation du formulaire",
      errors: [
        "Le nombre d'heures réalisées pour l'accompagnement individuel doit être inférieur ou égal au nombre d'heures prévues dans la demande de prise en charge.",
      ],
    });
  });
});
