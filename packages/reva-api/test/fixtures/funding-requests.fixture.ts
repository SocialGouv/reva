import { faker } from "@faker-js/faker";
import { Decimal } from "@prisma/client/runtime/library";
import { Gender } from "../../modules/candidate/candidate.types";

const zero = new Decimal(0);

const candidateInfo = {
  candidateSecondname: faker.person.middleName(),
  candidateThirdname: faker.person.middleName(),
  candidateGender: "undisclosed" as Gender,
};

const fundingContactInfo = {
  fundingContactFirstname: faker.person.firstName(),
  fundingContactLastname: faker.person.lastName(),
  fundingContactEmail: faker.internet.email(),
  fundingContactPhone: faker.phone.number(),
};

const fundingRequestBase = {
  ...candidateInfo,
  ...fundingContactInfo,
  basicSkillsCost: faker.number.int({ min: 0, max: 1000 }),
  certificateSkillsCost: faker.number.int({
    min: 0,
    max: 1000,
  }),
  collectiveCost: faker.number.int({ min: 0, max: 1000 }),
  individualCost: faker.number.int({ min: 0, max: 1000 }),
  mandatoryTrainingsCost: faker.number.int({
    min: 0,
    max: 1000,
  }),
  otherTrainingCost: faker.number.int({
    min: 0,
    max: 1000,
  }),
};

const fundingRequestBaseDecimal = {
  ...candidateInfo,
  ...fundingContactInfo,
  basicSkillsCost: new Decimal(faker.number.int({ min: 0, max: 1000 })),
  certificateSkillsCost: new Decimal(
    faker.number.int({
      min: 0,
      max: 1000,
    }),
  ),
  collectiveCost: new Decimal(faker.number.int({ min: 0, max: 1000 })),
  individualCost: new Decimal(faker.number.int({ min: 0, max: 1000 })),
  mandatoryTrainingsCost: new Decimal(
    faker.number.int({
      min: 0,
      max: 1000,
    }),
  ),
  otherTrainingCost: new Decimal(
    faker.number.int({
      min: 0,
      max: 1000,
    }),
  ),
};

export const FUNDING_REQUEST_NO_HOURS = {
  companionId: faker.string.uuid(),
  ...candidateInfo,
  ...fundingContactInfo,
  basicSkillsCost: zero,
  certificateSkillsCost: zero,
  collectiveCost: zero,
  individualCost: zero,
  mandatoryTrainingsCost: zero,
  otherTrainingCost: zero,
  basicSkillsHourCount: zero,
  certificateSkillsHourCount: zero,
  collectiveHourCount: zero,
  individualHourCount: zero,
  mandatoryTrainingsHourCount: zero,
  otherTrainingHourCount: zero,
  isPartialCertification: false,
};

export const FUNDING_REQUEST_FULL_CERT_OK_HOURS = {
  ...fundingRequestBase,
  isPartialCertification: false,
  basicSkillsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  certificateSkillsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  collectiveHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  individualHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  mandatoryTrainingsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  otherTrainingHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
};

export const FUNDING_REQUEST_FULL_CERT_OK_HOURS_DECIMAL = {
  ...fundingRequestBaseDecimal,
  basicSkillsHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.basicSkillsHourCount,
  ),
  certificateSkillsHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.certificateSkillsHourCount,
  ),
  collectiveHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.collectiveHourCount,
  ),
  individualHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.individualHourCount,
  ),
  mandatoryTrainingsHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.mandatoryTrainingsHourCount,
  ),
  otherTrainingHourCount: new Decimal(
    FUNDING_REQUEST_FULL_CERT_OK_HOURS.otherTrainingHourCount,
  ),
};

export const FUNDING_REQUEST_SAMPLE = {
  ...fundingRequestBase,
  basicSkillsCost: faker.number.int({
    min: 10,
    max: 1000,
  }),
  basicSkillsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  certificateSkillsCost: faker.number.int({
    min: 10,
    max: 1000,
  }),
  certificateSkillsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  collectiveCost: faker.number.int({ min: 10, max: 1000 }),
  collectiveHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  individualCost: faker.number.int({ min: 10, max: 1000 }),
  individualHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  mandatoryTrainingsCost: faker.number.int({
    min: 10,
    max: 1000,
  }),
  mandatoryTrainingsHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
  otherTrainingCost: faker.number.int({
    min: 10,
    max: 1000,
  }),
  otherTrainingHourCount: faker.number.int({
    min: 1,
    max: 100,
  }),
};

export const FUNDING_REQUEST_SAMPLE_FORMATTED_OUTPUT = {
  NomCandidat: FUNDING_REQUEST_SAMPLE.fundingContactLastname,
  PrenomCandidat1: FUNDING_REQUEST_SAMPLE.fundingContactFirstname,
  PrenomCandidat2: FUNDING_REQUEST_SAMPLE.candidateSecondname,
  PrenomCandidat3: FUNDING_REQUEST_SAMPLE.candidateThirdname,
  NbHeureDemAccVAEInd: `${FUNDING_REQUEST_SAMPLE.individualHourCount}.00`,
  CoutHeureDemAccVAEInd: `${FUNDING_REQUEST_SAMPLE.individualCost}.00`,
  NbHeureDemAccVAEColl: `${FUNDING_REQUEST_SAMPLE.collectiveHourCount}.00`,
  CoutHeureDemAccVAEColl: `${FUNDING_REQUEST_SAMPLE.collectiveCost}.00`,
  NHeureDemActeFormatifCompl: (() => {
    const formationComplementaire = [
      {
        count: FUNDING_REQUEST_SAMPLE.basicSkillsHourCount,
        cost: FUNDING_REQUEST_SAMPLE.basicSkillsCost,
      },
      {
        count: FUNDING_REQUEST_SAMPLE.mandatoryTrainingsHourCount,
        cost: FUNDING_REQUEST_SAMPLE.mandatoryTrainingsCost,
      },
      {
        count: FUNDING_REQUEST_SAMPLE.certificateSkillsHourCount,
        cost: FUNDING_REQUEST_SAMPLE.certificateSkillsCost,
      },
      {
        count: FUNDING_REQUEST_SAMPLE.otherTrainingHourCount,
        cost: FUNDING_REQUEST_SAMPLE.otherTrainingCost,
      },
    ];
    const total = formationComplementaire.reduce(
      (sum, fc) => sum + fc.count,
      0,
    );
    return `${total}.00`;
  })(),
  CoutHeureDemActeFormatifCompl: (() => {
    const formationComplementaire = [
      {
        count: FUNDING_REQUEST_SAMPLE.basicSkillsHourCount,
        cost: FUNDING_REQUEST_SAMPLE.basicSkillsCost,
      },
      {
        count: FUNDING_REQUEST_SAMPLE.mandatoryTrainingsHourCount,
        cost: FUNDING_REQUEST_SAMPLE.mandatoryTrainingsCost,
      },
      {
        count: FUNDING_REQUEST_SAMPLE.certificateSkillsHourCount,
        cost: FUNDING_REQUEST_SAMPLE.certificateSkillsCost,
      },
      {
        count: FUNDING_REQUEST_SAMPLE.otherTrainingHourCount,
        cost: FUNDING_REQUEST_SAMPLE.otherTrainingCost,
      },
    ];
    const formationComplementaireHeures = formationComplementaire.reduce(
      (heures, fc) => heures + fc.count,
      0,
    );
    if (formationComplementaireHeures === 0) return "0.00";
    const formationComplementaireCoutHoraireMoyen =
      formationComplementaire.reduce(
        (totalCost, fc) => totalCost + fc.cost * fc.count,
        0,
      ) / formationComplementaireHeures;
    return (
      Math.ceil(formationComplementaireCoutHoraireMoyen * 100) / 100
    ).toFixed(2);
  })(),
  ActeFormatifComplémentaire_FormationObligatoire: "",
  ActeFormatifComplémentaire_SavoirsDeBase: "0,2",
  ActeFormatifComplémentaire_BlocDeCompetencesCertifiant: "",
  ActeFormatifComplémentaire_Autre: "",
  ForfaitPartiel: 0,
};
