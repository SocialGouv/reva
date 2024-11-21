import { Gender } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { createCandidacyHelper } from "../../../../test/helpers/entities/create-candidacy-helper";
import { createFundingRequestHelper } from "../../../../test/helpers/entities/create-funding-request-helper";
import { createBatchFromFundingRequestUnifvae } from "./fundingRequestBatch";

test("Should create a nice batch", async () => {
  const candidacy = await createCandidacyHelper();
  const fundingRequest = await createFundingRequestHelper({
    candidacyId: candidacy.id,
    candidateFirstname: candidacy.candidate?.firstname,
    candidateLastname: candidacy.candidate?.lastname,
    candidateSecondname: candidacy.candidate?.firstname2,
    candidateThirdname: candidacy.candidate?.firstname3,
    candidateGender: candidacy.candidate?.gender as Gender,
    numAction: "mockNumAction",
    isPartialCertification: false,
    individualCost: new Decimal(12),
    individualHourCount: new Decimal(12),
    collectiveHourCount: new Decimal(18),
    collectiveCost: new Decimal(8),
    basicSkillsHourCount: new Decimal(2.5),
    basicSkillsCost: new Decimal(10),
    mandatoryTrainingsHourCount: new Decimal(4),
    mandatoryTrainingsCost: new Decimal(20),
    certificateSkillsHourCount: new Decimal(2),
    certificateSkillsCost: new Decimal(13),
    otherTrainingHourCount: new Decimal(0),
    otherTrainingCost: new Decimal(0),
    otherTraining: "Some other training(s)",
    certificateSkills: "Some certification skills",
  });

  const batch = await createBatchFromFundingRequestUnifvae(fundingRequest.id);
  expect(batch).not.toBeNull();
  expect(batch.content).toMatchObject({
    NumAction: "mockNumAction",
    ForfaitPartiel: 0,
    SiretAP: candidacy.organism?.siret,
    Certification: candidacy.certification?.rncpId,
    NomCandidat: candidacy.candidate?.lastname,
    PrenomCandidat1: candidacy.candidate?.firstname,
    PrenomCandidat2: candidacy.candidate?.firstname2,
    PrenomCandidat3: candidacy.candidate?.firstname3,
    ActeFormatifComplémentaire_FormationObligatoire: "",
    ActeFormatifComplémentaire_SavoirsDeBase: "",
    ActeFormatifComplémentaire_BlocDeCompetencesCertifiant:
      "Some certification skills",
    ActeFormatifComplémentaire_Autre: "Some other training(s)",
    CoutHeureDemAccVAEInd: "12.00",
    NbHeureDemAccVAEInd: "12.00",
    NbHeureDemAccVAEColl: "18.00",
    CoutHeureDemAccVAEColl: "8.00",
    NHeureDemActeFormatifCompl: "8.50",
    CoutHeureDemActeFormatifCompl: "15.42",
  });
});
