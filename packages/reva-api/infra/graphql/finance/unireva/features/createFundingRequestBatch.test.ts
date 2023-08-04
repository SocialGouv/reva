import { Decimal } from "@prisma/client/runtime";

import { Candidacy, Organism } from "../../../../../domain/types/candidacy";
import {
  Candidate,
  FundingRequestInput,
} from "../../../../../domain/types/candidate";
import { mapFundingRequestBatch } from "./createFundingRequest";

const defaultValidFundingRequest: FundingRequestInput = {
  id: "1234567",
  candidacyId: "123",
  basicSkills: [
    { id: "111", label: "Communication en français" },
    {
      id: "222",
      label:
        "Utilisation des règles de base de calcul et du raisonnement mathématique",
    },
    {
      id: "333",
      label: "Usage et communication numérique",
    },
  ],
  basicSkillsIds: ["111", "222", "333"],
  mandatoryTrainings: [
    {
      id: "111",
      label: "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)",
    },
    {
      id: "222",
      label: "Equipier de Première Intervention",
    },
    {
      id: "333",
      label: "Sauveteur Secouriste du Travail (SST)",
    },
    { id: "444", label: "Systèmes d'attaches" },
  ],
  mandatoryTrainingsIds: ["111", "222", "333", "444"],
  certificateSkills: "RCNP12 RCNP34",
  otherTraining: "other training",
  basicSkillsCost: new Decimal(20),
  basicSkillsHourCount: 1,
  certificateSkillsCost: new Decimal(20),
  certificateSkillsHourCount: 1,
  collectiveCost: new Decimal(35),
  collectiveHourCount: 15,
  diagnosisCost: new Decimal(70),
  diagnosisHourCount: 2,
  examCost: new Decimal(20),
  examHourCount: 2,
  individualCost: new Decimal(70),
  individualHourCount: 15,
  mandatoryTrainingsCost: new Decimal(20),
  mandatoryTrainingsHourCount: 1,
  postExamCost: new Decimal(70),
  postExamHourCount: 1,
  otherTrainingHourCount: 2,
  otherTrainingCost: new Decimal(30),
  totalCost: new Decimal(1885),
  companion: { siret: "1234" } as Organism,
  numAction: "reva_20221115_00000001",
};

const defaultCandidate = {
  firstname: "Michel",
  firstname2: "Michel2",
  firstname3: "Michel3",
  lastname: "Michelovitch",
  gender: "man",
  vulnerabilityIndicator: { label: "Demandeur d'emploi >12m" },
  highestDegree: { code: "N5_BAC_2" },
} as Partial<Candidate>;

const defaultCandidacy = {
  organism: {
    siret: "siretAp",
    label: "labelAp",
  },
  certification: {
    rncpId: "rncpId",
  },
} as Partial<Candidacy>;

describe("funding request batch", () => {
  describe("funding request batch content generation", () => {
    test("should generate a valid funding request batch content", () => {
      const fundingRequest = {
        ...defaultValidFundingRequest,
      };
      const result = mapFundingRequestBatch({
        fundingRequest,
        candidate: defaultCandidate as Candidate,
        candidacy: defaultCandidacy as Candidacy,
      });
      expect(result).toMatchObject({
        ActeFormatifComplémentaire_Autre: "other training",
        ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: "RCNP12 RCNP34",
        ActeFormatifComplémentaire_FormationObligatoire: "0,1,2,3",
        ActeFormatifComplémentaire_SavoirsDeBase: "0,1,2",
        CertificationVisée: "rncpId",
        CoutHeureDemAPDiag: 70,
        CoutHeureDemAPPostJury: 70,
        CoutHeureDemAccVAEColl: 35,
        CoutHeureDemAccVAEInd: 70,
        CoutHeureDemComplFormBlocDeCompetencesCertifiant: 20,
        CoutHeureDemComplFormObligatoire: 20,
        CoutHeureDemComplFormSavoirsDeBase: 20,
        CoutHeureJury: 20,
        IndPublicFragile: "1",
        NbHeureDemAPDiag: 2,
        NbHeureDemAPPostJury: 1,
        NbHeureDemAccVAEColl: 15,
        NbHeureDemAccVAEInd: 15,
        NbHeureDemComplFormBlocDeCompetencesCertifiant: 1,
        NbHeureDemComplFormObligatoire: 1,
        NbHeureDemComplFormSavoirsDeBase: 1,
        NbHeureDemJury: 2,
        NbHeureDemTotalActesFormatifs: 3,
        NiveauObtenuCandidat: "5",
        NomCandidat: "Michelovitch",
        NumAction: "reva_20221115_00000001",
        PrenomCandidat1: "Michel",
        PrenomCandidat2: "Michel2",
        PrenomCandidat3: "Michel3",
        SiretAP: "siretAp",
      });
    });
  });
});
