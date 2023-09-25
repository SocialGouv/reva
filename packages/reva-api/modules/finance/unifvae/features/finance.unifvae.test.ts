/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import {
  Account,
  Candidacy,
  CandidacyStatusStep,
  Candidate,
  FundingRequestUnifvae,
  Gender,
  Organism,
} from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";
import { organismDummy1 } from "../../../../test/fixtures/people-organisms";
import { authorizationHeaderForUser } from "../../../../test/helpers/authorization-helper";
import { injectGraphql } from "../../../../test/helpers/graphql-helper";

const candidateSample = {
  firstname: "Jojo",
  lastname: "De Garenne",
};

const fundingRequestSample = {
  candidateSecondname: "Lapin",
  candidateThirdname: "Piou",
  candidateGender: "man",
  basicSkillsCost: 12.3,
  basicSkillsHourCount: 2.5,
  certificateSkillsCost: 21.3,
  certificateSkillsHourCount: 2,
  collectiveCost: 21.3,
  collectiveHourCount: 2,
  individualCost: 21.3,
  individualHourCount: 2,
  mandatoryTrainingsCost: 21.3,
  mandatoryTrainingsHourCount: 2,
  otherTrainingCost: 21.3,
  otherTrainingHourCount: 2.5,
  fundingContactFirstname: "Ramuncho",
  fundingContactLastname: "Delavega",
  fundingContactEmail: "ramdelav@disney.com",
  fundingContactPhone: "+4472334567890",
};

const candidateEmail = "toto@bongo.eu",
  aapEmail = "aap@formation.com",
  aapKeycloakId = "e4965f17-6c39-4ed2-8786-e504e320e476",
  myCandidateEmail = "meuh@cocorico.com",
  myCandidatKeycloakId = "f5965f17-6c39-4ed2-8786-e504e320e476";

let organism: Organism,
  myCandidate: Candidate,
  candidacyUnireva: Candidacy,
  candidacyUnifvae: any,
  aapAccount: Account,
  basicSkillId1: string,
  basicSkillId2: string,
  myCandidacy: any,
  myFundingRequest: FundingRequestUnifvae;

const basicSkill1Label = "Pêche au coup",
  basicSkill2Label = "Arboriculture";

beforeAll(async () => {
  const bs1 = await prismaClient.basicSkill.create({
    data: { label: basicSkill1Label },
    select: { id: true },
  });
  basicSkillId1 = bs1.id;
  const bs2 = await prismaClient.basicSkill.create({
    data: { label: basicSkill2Label },
    select: { id: true },
  });
  basicSkillId2 = bs2.id;

  organism = await prismaClient.organism.create({ data: organismDummy1 });
  aapAccount = await prismaClient.account.create({
    data: {
      email: aapEmail,
      keycloakId: aapKeycloakId,
      organismId: organism.id,
    },
  });

  const departmentManche = await prismaClient.department.findUniqueOrThrow({
    where: { code: "50" },
    select: { id: true },
  });

  myCandidate = await prismaClient.candidate.create({
    data: {
      gender: fundingRequestSample.candidateGender as Gender,
      firstname: candidateSample.firstname,
      lastname: candidateSample.lastname,
      email: candidateEmail,
      keycloakId: myCandidatKeycloakId,
      phone: "0123456789",
      departmentId: departmentManche.id,
    },
  });

  candidacyUnifvae = await prismaClient.candidacy.create({
    data: {
      deviceId: candidateEmail,
      email: candidateEmail,
      organismId: organism.id,
      financeModule: "unifvae",
      candidateId: myCandidate.id,
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
      basicSkills: {
        createMany: {
          data: [
            { basicSkillId: basicSkillId1 },
            { basicSkillId: basicSkillId2 },
          ],
        },
      },
      Feasibility: {
        create: {
          decision: "ADMISSIBLE",
          certificationAuthority: { create: { label: "dummy" } },
          feasibilityFile: {
            create: {
              name: "dummyFile.ext",
              content: new Buffer("coucou"),
              mimeType: "kikoo/lol",
            },
          },
        },
      },
    },
    include: {
      trainings: true,
      basicSkills: true,
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
  myCandidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: myCandidateEmail,
      email: myCandidateEmail,
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
      basicSkills: {
        createMany: {
          data: [
            { basicSkillId: basicSkillId1 },
            { basicSkillId: basicSkillId2 },
          ],
        },
      },
    },
    include: {
      trainings: true,
      basicSkills: true,
    },
  });
  myFundingRequest = await prismaClient.fundingRequestUnifvae.create({
    data: {
      candidacyId: myCandidacy.id,
      ...fundingRequestSample,
      candidateFirstname: myCandidate.firstname,
      candidateSecondname: fundingRequestSample.candidateSecondname,
      candidateThirdname: fundingRequestSample.candidateThirdname,
      candidateLastname: myCandidate.lastname,
      candidateGender: fundingRequestSample.candidateGender as Gender,
      otherTraining: candidacyUnifvae.otherTraining ?? "",
      certificateSkills: candidacyUnifvae.certificateSkills ?? "",
      basicSkills: {
        create: [{ basicSkill: { create: { label: "skillA" } } }],
      },
      mandatoryTrainings: {
        create: [{ training: { create: { label: "trainingA" } } }],
      },
    },
  });
});

afterAll(async () => {
  await prismaClient.feasibility.deleteMany({});
  await prismaClient.file.deleteMany({});
  await prismaClient.trainingOnFundingRequestsUnifvae.deleteMany();
  await prismaClient.basicSkillOnFundingRequestsUnifvae.deleteMany();
  await prismaClient.fundingRequestBatchUnifvae.deleteMany();
  await prismaClient.fundingRequestUnifvae.deleteMany();
  await prismaClient.candidaciesStatus.deleteMany();
  await prismaClient.basicSkillOnCandidacies.deleteMany();
  await prismaClient.candidacy.deleteMany();
  await prismaClient.organism.deleteMany();
  await prismaClient.account.deleteMany();
  await prismaClient.candidate.deleteMany();
  await prismaClient.training.delete({ where: { label: "trainingA" } });
  await prismaClient.basicSkill.delete({ where: { label: "skillA" } });
  await prismaClient.basicSkill.deleteMany({
    where: { id: { in: [basicSkillId1, basicSkillId2] } },
  });
});

test("should create fundingRequestUnifvae with matching batch", async () => {
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
  myCandidate = await prismaClient.candidate.findUniqueOrThrow({
    where: { id: myCandidate.id },
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
      SiretAP: organism.siret,
      // Certification: ,
      NomCandidat: myCandidate.lastname,
      PrenomCandidat1: myCandidate.firstname,
      PrenomCandidat2: myCandidate.firstname2,
      PrenomCandidat3: myCandidate.firstname3,
      ActeFormatifComplémentaire_FormationObligatoire: "",
      ActeFormatifComplémentaire_SavoirsDeBase: "Arboriculture, Pêche au coup",
      ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: "",
      ActeFormatifComplémentaire_Autre: "",
      NbHeureDemAccVAEInd: "2.00",
      CoutHeureDemAccVAEInd: "21.30",
      NbHeureDemAccVAEColl: "2.00",
      CoutHeureDemAccVAEColl: "21.30",
      NHeureDemActeFormatifCompl: "9.00",
      CoutHeureDemActeFormatifCompl: "169.20",
      ForfaitPartiel: 0,
    },
  });
});

test("Should fail to create fundingRequestUnifvae when candidacy is not bound to Unifvae finance module", async () => {
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
    'Cannot create FundingRequestUnifvae: candidacy.financeModule is "unireva"'
  );
});

test("should fetch fundingRequestUnifvae", async () => {
  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role: "manage_candidacy",
      keycloakId: aapKeycloakId,
    }),
    payload: {
      requestType: "query",
      endpoint: "candidacy_getFundingRequestUnifvae",
      returnFields:
        "{id, isPartialCertification, candidateFirstname, candidateSecondname, candidateThirdname, candidateLastname, candidateGender, basicSkills {id, label}, mandatoryTrainings {id, label}, basicSkillsCost, basicSkillsHourCount, certificateSkillsCost, certificateSkillsHourCount, collectiveCost, collectiveHourCount, individualCost, individualHourCount, mandatoryTrainingsCost, mandatoryTrainingsHourCount, otherTrainingCost, otherTrainingHourCount }",
      arguments: {
        candidacyId: myCandidacy.id,
      },
    },
  });
  expect(resp.statusCode).toBe(200);
  const obj = resp.json();
  expect(obj).not.toHaveProperty("errors");
  expect(obj.data.candidacy_getFundingRequestUnifvae).toMatchObject({
    candidateFirstname: myCandidate.firstname,
    candidateLastname: myCandidate.lastname,
    candidateGender: myCandidate.gender,
    basicSkillsCost: myFundingRequest.basicSkillsCost.toNumber(),
    basicSkillsHourCount: myFundingRequest.basicSkillsHourCount.toNumber(),
    certificateSkillsCost: myFundingRequest.certificateSkillsCost.toNumber(),
    certificateSkillsHourCount:
      myFundingRequest.certificateSkillsHourCount.toNumber(),
    collectiveCost: myFundingRequest.collectiveCost.toNumber(),
    collectiveHourCount: myFundingRequest.collectiveHourCount.toNumber(),
    individualCost: myFundingRequest.individualCost.toNumber(),
    individualHourCount: myFundingRequest.individualHourCount.toNumber(),
    mandatoryTrainingsCost: myFundingRequest.mandatoryTrainingsCost.toNumber(),
    mandatoryTrainingsHourCount:
      myFundingRequest.mandatoryTrainingsHourCount.toNumber(),
    otherTrainingCost: myFundingRequest.otherTrainingCost.toNumber(),
    otherTrainingHourCount: myFundingRequest.otherTrainingHourCount.toNumber(),
    basicSkills: [{ label: "skillA" }],
    mandatoryTrainings: [{ label: "trainingA" }],
  });
});
