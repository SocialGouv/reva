import { Decimal } from "@prisma/client/runtime/library";

import * as getCandidacyByIdModule from "../../../candidacy/features/getCandidacyById";
import * as getAfgsuTrainingIdModule from "../../../candidacy/training/features/getAfgsuTrainingId";
import * as getCandidateByIdModule from "../../../candidate/features/getCandidateById";
import * as fundingRequestsDb from "../database/fundingRequests";
import * as paymentRequestsDb from "../database/paymentRequest";
import { FundingRequest, PaymentRequest } from "../finance.types";

import { createOrUpdatePaymentRequestForCandidacy } from "./createOrUpdatePaymentRequestForCandidacy";

const defaultValidPaymentRequest: PaymentRequest = {
  id: "1234",
  basicSkillsEffectiveHourCount: 1,
  basicSkillsEffectiveCost: new Decimal(1),
  certificateSkillsEffectiveHourCount: 2,
  certificateSkillsEffectiveCost: new Decimal(2),
  collectiveEffectiveHourCount: 3,
  collectiveEffectiveCost: new Decimal(3),
  diagnosisEffectiveHourCount: 2,
  diagnosisEffectiveCost: new Decimal(3),
  examEffectiveHourCount: 1,
  examEffectiveCost: new Decimal(5),
  individualEffectiveHourCount: 6,
  individualEffectiveCost: new Decimal(6),
  mandatoryTrainingsEffectiveHourCount: 7,
  mandatoryTrainingsEffectiveCost: new Decimal(7),
  postExamEffectiveHourCount: 1,
  postExamEffectiveCost: new Decimal(8),
  otherTrainingEffectiveHourCount: 2,
  otherTrainingEffectiveCost: new Decimal(25),
  invoiceNumber: "invoiceNumber_123",
};

const defaultValidFundingRequest: FundingRequest = {
  id: "5678",
  basicSkillsHourCount: 1,
  certificateSkillsHourCount: 2,
  collectiveHourCount: 3,
  diagnosisHourCount: 2,
  examHourCount: 1,
  individualHourCount: 6,
  mandatoryTrainingsHourCount: 7,
  postExamHourCount: 1,
  mandatoryTrainings: [],
} as FundingRequest;

describe("create or update payment request", () => {
  describe("create or update payment request", () => {
    test("should create a new valid payment request", async () => {
      jest
        .spyOn(paymentRequestsDb, "createPaymentRequest")
        .mockImplementation(
          (params: { candidacyId: string; paymentRequest: PaymentRequest }) =>
            Promise.resolve(params.paymentRequest as any),
        );

      jest
        .spyOn(paymentRequestsDb, "getPaymentRequestByCandidacyId")
        .mockImplementation(() => Promise.resolve(null));

      jest
        .spyOn(fundingRequestsDb, "getFundingRequest")
        .mockImplementation(() =>
          Promise.resolve(defaultValidFundingRequest as any),
        );

      jest
        .spyOn(paymentRequestsDb, "updatePaymentRequest")
        .mockImplementation(() =>
          Promise.reject("Test should not run update method"),
        );

      jest
        .spyOn(getAfgsuTrainingIdModule, "getAfgsuTrainingId")
        .mockImplementation(() => Promise.resolve(null));

      jest
        .spyOn(getCandidacyByIdModule, "getCandidacyById")
        .mockImplementation(() => ({}) as any);

      jest
        .spyOn(getCandidateByIdModule, "getCandidateById")
        .mockImplementation(() => ({}) as any);

      const result = await createOrUpdatePaymentRequestForCandidacy({
        candidacyId: "1234",
        paymentRequest: defaultValidPaymentRequest,
      });
      expect(result).toMatchObject(defaultValidPaymentRequest);
    });
  });

  test("should update an existing valid payment request", async () => {
    jest
      .spyOn(paymentRequestsDb, "createPaymentRequest")
      .mockImplementation(() =>
        Promise.reject("Test should not run create method"),
      );

    jest
      .spyOn(paymentRequestsDb, "getPaymentRequestByCandidacyId")
      .mockImplementation(() =>
        Promise.resolve(defaultValidPaymentRequest as any),
      );

    jest
      .spyOn(fundingRequestsDb, "getFundingRequest")
      .mockImplementation(() =>
        Promise.resolve(defaultValidFundingRequest as any),
      );

    jest
      .spyOn(paymentRequestsDb, "updatePaymentRequest")
      .mockImplementation((params: { paymentRequest: PaymentRequest }) =>
        Promise.resolve(params.paymentRequest as any),
      );

    jest
      .spyOn(getAfgsuTrainingIdModule, "getAfgsuTrainingId")
      .mockImplementation(() => Promise.resolve(null));

    jest
      .spyOn(getCandidacyByIdModule, "getCandidacyById")
      .mockImplementation(() => ({}) as any);

    jest
      .spyOn(getCandidateByIdModule, "getCandidateById")
      .mockImplementation(() => ({}) as any);
    const result = await createOrUpdatePaymentRequestForCandidacy({
      candidacyId: "1234",
      paymentRequest: defaultValidPaymentRequest,
    });
    expect(result).toMatchObject(defaultValidPaymentRequest);
  });
});
