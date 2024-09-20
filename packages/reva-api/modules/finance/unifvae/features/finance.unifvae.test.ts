/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { CandidacyStatusStep } from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";

import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";
import {
  createCandidacyUnifvae,
  createCandidacyUnireva,
  createCandidateJPL,
  createExpertFiliereOrganism,
  createFundingRequest,
} from "../../../../test/helpers/create-db-entity";
import {
  candidateJPL,
  expertFiliereOrganism,
  gestionaMaisonMereAapAccount1,
} from "../../../../test/fixtures/people-organisms";
import {
  candidacyUnifvae,
  candidacyUnireva,
  dropOutSixMonthsAgo,
  dropOutSixMonthsAgoMinusOneMinute,
} from "../../../../test/fixtures/candidacy";
import {
  fundingRequestSample,
  paymentRequestInputBase,
} from "../../../../test/fixtures/funding-request";
import {
  basicSkill1Label,
  training1Label,
} from "../../../../test/fixtures/skillAndTraining";

beforeAll(async () => {
  await createExpertFiliereOrganism();
  await createCandidateJPL();
  await createCandidacyUnifvae();
  await createCandidacyUnireva();
});

afterAll(async () => {
  await prismaClient.feasibility.deleteMany({});
  await prismaClient.file.deleteMany({});
  await prismaClient.candidaciesStatus.deleteMany();
  await prismaClient.basicSkillOnCandidacies.deleteMany();
  await prismaClient.candidacyLog.deleteMany();
  await prismaClient.candidacy.deleteMany();
  await prismaClient.account.updateMany({ data: { organismId: null } });
  await prismaClient.organism.deleteMany();
  await prismaClient.maisonMereAAPOnConventionCollective.deleteMany();
  await prismaClient.maisonMereAAP.deleteMany();
  await prismaClient.account.deleteMany();
  await prismaClient.candidate.deleteMany();
});

afterEach(async () => {
  await prismaClient.trainingOnFundingRequestsUnifvae.deleteMany();
  await prismaClient.basicSkillOnFundingRequestsUnifvae.deleteMany();
  await prismaClient.paymentRequestBatchUnifvae.deleteMany();
  await prismaClient.paymentRequestUnifvae.deleteMany();
  await prismaClient.fundingRequestBatchUnifvae.deleteMany();
  await prismaClient.fundingRequestUnifvae.deleteMany();
  await prismaClient.candidacyDropOut.deleteMany();
});

const injectGraphqlPaymentRequestCreation = async () =>
  injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: gestionaMaisonMereAapAccount1.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createOrUpdatePaymentRequestUnifvae",
      returnFields: "{ id }",
      arguments: {
        candidacyId: candidacyUnifvae.id,
        paymentRequest: {
          ...paymentRequestInputBase,
        },
      },
    },
  });

const dropOutCandidacySixMonthsAgoMinusOneMinute = async ({
  proofReceivedByAdmin,
}: {
  proofReceivedByAdmin: boolean;
}) =>
  prismaClient.candidacy.update({
    where: { id: candidacyUnifvae.id },
    data: {
      candidacyDropOut: {
        create: {
          ...dropOutSixMonthsAgoMinusOneMinute,
          dropOutReason: { connect: { label: "Autre" } },
          proofReceivedByAdmin,
        },
      },
    },
  });

test("should create fundingRequestUnifvae with matching batch", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: gestionaMaisonMereAapAccount1.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount, fundingContactFirstname, fundingContactLastname, fundingContactEmail, fundingContactPhone }",
      arguments: {
        candidacyId: candidacyUnifvae.id,
        fundingRequest: {
          ...fundingRequestSample,
        },
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

  // Check candidate
  const myCandidate = await prismaClient.candidate.findUniqueOrThrow({
    where: { id: candidateJPL.id },
  });
  expect(myCandidate).toMatchObject({
    firstname2: fundingRequestSample.candidateSecondname,
    firstname3: fundingRequestSample.candidateThirdname,
    gender: fundingRequestSample.candidateGender,
  });

  // Check batch
  const myFundReqBatch =
    await prismaClient.fundingRequestBatchUnifvae.findFirst({
      where: { fundingRequestId: obj.data.id },
    });
  expect(myFundReqBatch).toMatchObject({
    sent: false,
    content: {
      SiretAP: expertFiliereOrganism.siret,
      // Certification: ,
      NomCandidat: myCandidate.lastname,
      PrenomCandidat1: myCandidate.firstname,
      PrenomCandidat2: myCandidate.firstname2,
      PrenomCandidat3: myCandidate.firstname3,
      ActeFormatifComplémentaire_FormationObligatoire: "",
      ActeFormatifComplémentaire_SavoirsDeBase: "0,2",
      ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: "",
      ActeFormatifComplémentaire_Autre: "",
      NbHeureDemAccVAEInd: "2.00",
      CoutHeureDemAccVAEInd: "21.30",
      NbHeureDemAccVAEColl: "2.00",
      CoutHeureDemAccVAEColl: "21.30",
      NHeureDemActeFormatifCompl: "9.00",
      CoutHeureDemActeFormatifCompl: "18.80",
      ForfaitPartiel: 0,
    },
  });
});

test("Should fail to create fundingRequestUnifvae when candidacy is not bound to Unifvae finance module", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: gestionaMaisonMereAapAccount1.keycloakId,
    }),
    payload: {
      requestType: "mutation",
      endpoint: "candidacy_createFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount }",
      arguments: {
        candidacyId: candidacyUnireva.id,
        fundingRequest: {
          ...fundingRequestSample,
        },
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

test("should fetch fundingRequestUnifvae", async () => {
  await createFundingRequest();

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: gestionaMaisonMereAapAccount1.keycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "candidacy_getFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, fundingContactEmail, fundingContactFirstname, fundingContactLastname, fundingContactPhone, basicSkills {label}, mandatoryTrainings {label}, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount }",
      arguments: {
        candidacyId: candidacyUnifvae.id,
      },
    },
  });
  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).not.toHaveProperty("errors");

  expect(obj.data.candidacy_getFundingRequestUnifvae).toMatchObject({
    ...fundingRequestSample,
    basicSkills: [{ label: basicSkill1Label }],
    mandatoryTrainings: [{ label: training1Label }],
  });
});

test("should fail to create paymentRequestUnifvae when candidacy was drop out less than 6 months ago then succeed after 6 months", async () => {
  await dropOutCandidacySixMonthsAgoMinusOneMinute({
    proofReceivedByAdmin: false,
  });

  const resp = await injectGraphqlPaymentRequestCreation();

  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).toHaveProperty("errors");
  expect(obj.errors[0].message).toBe(
    "La demande de paiement n’est pas encore disponible. Vous y aurez accès 6 mois après la mise en abandon du candidat.",
  );

  await prismaClient.candidacy.update({
    where: { id: candidacyUnifvae.id },
    data: {
      candidacyDropOut: {
        update: dropOutSixMonthsAgo,
      },
    },
  });

  const resp2 = await injectGraphqlPaymentRequestCreation();

  const obj2 = resp2.json();
  expect(obj2).not.toHaveProperty("errors");
});

test("should allow the creation of paymentRequestUnifvae when candidacy was drop out less than 6 months ago but the proof was received by an admin", async () => {
  await dropOutCandidacySixMonthsAgoMinusOneMinute({
    proofReceivedByAdmin: true,
  });

  const resp = await injectGraphqlPaymentRequestCreation();
  const obj = resp.json();
  expect(obj).not.toHaveProperty("errors");
});
