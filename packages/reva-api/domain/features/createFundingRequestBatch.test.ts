import { Candidacy, Organism } from "../types/candidacy";
import { Candidate, FundingRequestInput } from "../types/candidate";
import { mapFundingRequestBatch } from "./createFundingRequest";

const defaultValidFundingRequest: FundingRequestInput = {
  id: "1234567",
  candidacyId: "123",
  basicSkills: [
    {
      id: "333",
      label:
        "Utilisation des règles de base de calcul et du raisonnement mathématique",
    },
    {
      id: "444",
      label: "Usage et communication numérique",
    },
  ],
  basicSkillsIds: ["333", "444"],
  mandatoryTrainings: [
    {
      id: "444",
      label: "Equipier de Première Intervention",
    },
    {
      id: "555",
      label: "Sauveteur Secouriste du Travail (SST)",
    },
  ],
  mandatoryTrainingsIds: ["444", "555"],
  certificateSkills: "RCNP12 RCNP34",
  otherTraining: "other training",
  basicSkillsCost: 20,
  basicSkillsHourCount: 1,
  certificateSkillsCost: 20,
  certificateSkillsHourCount: 1,
  collectiveCost: 35,
  collectiveHourCount: 15,
  diagnosisCost: 70,
  diagnosisHourCount: 2,
  examCost: 20,
  examHourCount: 2,
  individualCost: 70,
  individualHourCount: 15,
  mandatoryTrainingsCost: 20,
  mandatoryTrainingsHourCount: 1,
  postExamCost: 70,
  postExamHourCount: 1,
  totalCost: 1885,
  companion: { siret: "1234" } as Organism,
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
        numAction: "reva_01012022_00000001",
        candidate: defaultCandidate as Candidate,
        candidacy: defaultCandidacy as Candidacy,
      });
      expect(result).toMatchObject({
        AccompagnateurCandidat: "1234",
        ActeFormatifComplémentaire_Autre: "other training",
        ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: "RCNP12 RCNP34",
        ActeFormatifComplémentaire_FormationObligatoire: "1,2",
        ActeFormatifComplémentaire_SavoirsDeBase: "1,2",
        CertificationVisée: "rncpId",
        CoutHeureDemAPDiag: 70,
        CoutHeureDemAPPostJury: 70,
        CoutHeureDemAccVAEColl: 35,
        CoutHeureDemAccVAEInd: 70,
        CoutHeureDemComplFormBlocDeCompetencesCertifiant: 20,
        CoutHeureDemComplFormObligatoire: 20,
        CoutHeureDemComplFormSavoirsDeBase: 20,
        CoutHeureJury: 20,
        GenreCandidat: "1",
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
        NomAP: "labelAp",
        NomCandidat: "Michelovitch",
        NumAction: "reva_01012022_00000001",
        PrenomCandidat1: "Michel",
        PrenomCandidat2: "Michel2",
        PrenomCandidat3: "Michel3",
        SiretAP: "siretAp",
        CoutTotalDemande: 1885,
      });
    });
  });
});
