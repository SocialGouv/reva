import {
  Candidacy,
  Certification,
  FundingRequestBatchUnifvae,
  FundingRequestUnifvae,
  Gender,
  Organism,
  Region,
} from "@prisma/client";

import { prismaClient } from "../../../../prisma/client";
import { organismDummy1 } from "../../../../test/fixtures/people-organisms";
import { createBatchFromFundingRequestUnifvae } from "./fundingRequestBatch";

let regionIdf: Region | null = null,
  certif: Certification | null = null,
  aap: Organism | null = null,
  candidacy: Candidacy | null = null,
  fundReq: FundingRequestUnifvae | null,
  batch: FundingRequestBatchUnifvae | null;

const candidateSample = {
  candidateFirstname: "John",
  candidateLastname: "Mac Kayne",
  candidateGender: "undisclosed" as Gender,
};

beforeAll(async () => {
  aap = await prismaClient.organism.create({
    data: organismDummy1,
  });
  regionIdf = await prismaClient.region.findUnique({ where: { code: "11" } });
  certif = await prismaClient.certification.findFirst({
    where: { label: "CAP Boucher" },
  });
  candidacy = await prismaClient.candidacy.create({
    data: {
      deviceId: "jojopipo@mimimi.io",
      certificationsAndRegions: {
        create: [
          {
            regionId: (regionIdf as Region).id,
            certificationId: (certif as Certification).id,
            author: "nawak",
          },
        ],
      },
      organismId: aap.id,
    },
  });
  fundReq = await prismaClient.fundingRequestUnifvae.create({
    data: {
      candidacyId: (candidacy as Candidacy).id,
      basicSkills: {
        create: [
          { basicSkill: { create: { label: "skillA" } } },
          { basicSkill: { create: { label: "skillB" } } },
        ],
      },
      mandatoryTrainings: {
        create: [
          {
            training: {
              connect: {
                label: "Prévention et secours civiques de niveau 1 (PSC1)",
              },
            },
          },
          {
            training: {
              connect: {
                label: "Premiers secours en équipe de niveau 1 (PSE1)",
              },
            },
          },
        ],
      },
      numAction: "zobilol123",
      isPartialCertification: false,
      ...candidateSample,
      individualCost: 12,
      individualHourCount: 12,
      collectiveHourCount: 18,
      collectiveCost: 8,
      basicSkillsHourCount: 2.5,
      basicSkillsCost: 10,
      mandatoryTrainingsHourCount: 4,
      mandatoryTrainingsCost: 20,
      certificateSkillsHourCount: 2,
      certificateSkillsCost: 13,
      otherTrainingHourCount: 0,
      otherTrainingCost: 0,
      otherTraining: "Some other training(s)",
      certificateSkills: "Some certification skills",
    },
  });
});

afterAll(async () => {
  await prismaClient.fundingRequestBatchUnifvae.deleteMany({});
  await prismaClient.trainingOnFundingRequestsUnifvae.deleteMany({
    where: { fundingRequestUnifvaeId: fundReq?.id },
  });
  await prismaClient.basicSkillOnFundingRequestsUnifvae.deleteMany({
    where: { fundingRequestUnifvaeId: fundReq?.id },
  });
  await prismaClient.fundingRequestUnifvae.delete({
    where: { id: (fundReq as FundingRequestUnifvae).id },
  });
  await prismaClient.candidaciesOnRegionsAndCertifications.deleteMany({
    where: { candidacyId: candidacy?.id },
  });
  await prismaClient.candidacy.delete({
    where: { id: (candidacy as Candidacy).id },
  });
  await prismaClient.organism.delete({ where: { id: (aap as Organism).id } });
  await prismaClient.basicSkill.deleteMany({
    where: { label: { in: ["skillA", "skillB"] } },
  });
});

test("Should create a nice batch", async () => {
  batch = await createBatchFromFundingRequestUnifvae(
    (fundReq as FundingRequestUnifvae).id
  );
  expect(batch).not.toBeNull();
  expect(batch.content).toMatchObject({
    NumAction: "zobilol123",
    ForfaitPartiel: 0,
    SiretAP: aap?.siret,
    Certification: certif?.rncpId,
    NomCandidat: candidateSample.candidateLastname,
    PrenomCandidat1: candidateSample.candidateFirstname,
    PrenomCandidat2: null,
    PrenomCandidat3: null,
    ActeFormatifComplémentaire_FormationObligatoire: "4, 5",
    ActeFormatifComplémentaire_SavoirsDeBase: "skillA, skillB",
    ActeFormatifComplémentaire_BlocDeCompetencesCertifiant:
      "Some certification skills",
    ActeFormatifComplémentaire_Autre: "Some other training(s)",
    CoutHeureDemAccVAEInd: "12.00",
    NbHeureDemAccVAEInd: "12.00",
    NbHeureDemAccVAEColl: "18.00",
    CoutHeureDemAccVAEColl: "8.00",
    NHeureDemActeFormatifCompl: "8.50",
    CoutHeureDemActeFormatifCompl: "131.00",
  });
});
