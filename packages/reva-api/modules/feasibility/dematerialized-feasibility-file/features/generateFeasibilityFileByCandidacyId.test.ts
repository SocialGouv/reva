import { randomUUID } from "node:crypto";

import {
  CompetenceBlocsPartCompletionEnum,
  DFFCertificationCompetenceDetailsState,
  DFFDecision,
  DFFEligibilityRequirement,
  ExperienceDuration,
  FeasibilityFormat,
  Gender,
  PrerequisiteState,
} from "@prisma/client";
import { PDFExtract } from "pdf.js-extract";

import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeasibilityDematerializedHelper } from "@/test/helpers/entities/create-feasibility-dematerialized-helper";

import { generateFeasibilityFileByCandidacyId } from "./generateFeasibilityFileByCandidacyId";

type ExtractedContentItem = {
  str?: string;
};

type ExtractedPage = {
  content?: ExtractedContentItem[];
};

type ExtractedPdf = {
  pages: ExtractedPage[];
};

type SectionDefinition = {
  name: string;
  title: string;
};

type StructuredSection = SectionDefinition & {
  lines: string[];
  startIndex: number;
};

const normalizeText = (value: string) =>
  value
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 0)
    .join("\n");

const canonicalizeText = (value: string) =>
  normalizeText(value).replace(/BLOC-[A-Z0-9]+/g, "BLOC-CODE");

const getCanonicalLines = (value: string) =>
  canonicalizeText(value)
    .split("\n")
    .filter((line) => line.length > 0);

const SECTION_DEFINITIONS: ReadonlyArray<SectionDefinition> = [
  { name: "admissibility", title: "Dossier de faisabilité" },
  { name: "candidate", title: "M. Dupont Jean" },
  { name: "educationLevel", title: "Niveau de formation" },
  { name: "certification", title: "Certification visée" },
  { name: "competenceBloc", title: "Blocs de compétences" },
  { name: "prerequisites", title: "Prérequis obligatoires" },
  { name: "experiences", title: "Expériences professionnelles" },
  { name: "trainingPlan", title: "Parcours envisagé" },
  { name: "basicSkills", title: "Savoir de base" },
  { name: "goals", title: "Objectifs poursuivis par le candidat" },
  { name: "decision", title: "Avis de faisabilité" },
];

const setupCompleteDematerializedFeasibilityFile = async () => {
  const [parisDepartment, franceCountry] = await Promise.all([
    prismaClient.department.findFirstOrThrow({ where: { code: "75" } }),
    prismaClient.country.findFirstOrThrow({ where: { label: "France" } }),
  ]);

  const highestDegree = await prismaClient.degree.create({
    data: {
      code: randomUUID(),
      label: "Diplôme de niveau 7",
      longLabel: "Diplôme supérieur de niveau 7",
      level: 7,
    },
  });

  const educationDegree = await prismaClient.degree.create({
    data: {
      code: randomUUID(),
      label: "Diplôme de niveau 5",
      longLabel: "Diplôme supérieur de niveau 5",
      level: 5,
    },
  });

  const candidate = await createCandidateHelper({
    firstname: "Jean",
    firstname2: null,
    firstname3: null,
    lastname: "Dupont",
    gender: Gender.man,
    givenName: null,
    email: "jean.dupont@example.com",
    phone: "0601020304",
    birthdate: new Date("1990-05-20T00:00:00.000Z"),
    birthCity: "Lyon",
    birthDepartmentId: parisDepartment.id,
    departmentId: parisDepartment.id,
    countryId: franceCountry.id,
    nationality: "Française",
    street: "10 rue de Paris",
    zip: "75001",
    city: "Paris",
    addressComplement: null,
    highestDegreeId: highestDegree.id,
    niveauDeFormationLePlusEleveDegreeId: educationDegree.id,
    highestDegreeLabel: "Licence Informatique",
  });

  const certification = await createCertificationHelper({
    label: "Manager de la performance",
    rncpId: "99999",
    rncpLabel: "Manager de la performance",
    feasibilityFormat: FeasibilityFormat.DEMATERIALIZED,
  });

  const candidacy = await createCandidacyHelper({
    certificationId: certification.id,
    candidacyArgs: {
      candidateId: candidate.id,
      additionalHourCount: 8,
      individualHourCount: 12,
      collectiveHourCount: 6,
    },
  });

  const feasibility = await createFeasibilityDematerializedHelper({
    candidacyId: candidacy.id,
    dematerializedFeasibilityFile: {
      create: {
        option: "Option Performance",
        firstForeignLanguage: "Anglais",
        secondForeignLanguage: "Espagnol",
        attachmentsPartComplete: true,
        certificationPartComplete: true,
        prerequisitesPartComplete: true,
        competenceBlocsPartCompletion:
          CompetenceBlocsPartCompletionEnum.COMPLETED,
        eligibilityRequirement:
          DFFEligibilityRequirement.FULL_ELIGIBILITY_REQUIREMENT,
        eligibilityValidUntil: new Date("2025-12-31T00:00:00.000Z"),
        aapDecision: DFFDecision.FAVORABLE,
        aapDecisionComment: "Avis favorable pour la suite",
      },
    },
  });

  const dematerializedFeasibilityFileId =
    feasibility.dematerializedFeasibilityFile?.id;

  if (!dematerializedFeasibilityFileId) {
    throw new Error("Dematerialized feasibility file was not created");
  }

  const competenceBloc = await prismaClient.certificationCompetenceBloc.create({
    data: {
      certificationId: certification.id,
      code: `BLOC-${randomUUID().slice(0, 4).toUpperCase()}`,
      label: "Bloc de compétences Gestion",
    },
  });

  const competence = await prismaClient.certificationCompetence.create({
    data: {
      blocId: competenceBloc.id,
      label: "Analyser des besoins clients",
      index: 1,
    },
  });

  await prismaClient.dFFCertificationCompetenceBloc.create({
    data: {
      dematerializedFeasibilityFileId,
      certificationCompetenceBlocId: competenceBloc.id,
      text: "Expérience significative en situation réelle",
      complete: true,
    },
  });

  await prismaClient.dFFCertificationCompetenceDetails.create({
    data: {
      dematerializedFeasibilityFileId,
      certificationCompetenceId: competence.id,
      state: DFFCertificationCompetenceDetailsState.YES,
    },
  });

  const attachTraining = async (label: string) => {
    const training = await prismaClient.training.findFirstOrThrow({
      where: { label },
    });

    await prismaClient.trainingOnCandidacies.upsert({
      where: {
        trainingId_candidacyId: {
          trainingId: training.id,
          candidacyId: candidacy.id,
        },
      },
      update: {},
      create: { trainingId: training.id, candidacyId: candidacy.id },
    });
  };

  await Promise.all([
    attachTraining(
      "Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)",
    ),
    attachTraining("Equipier de Première Intervention"),
  ]);

  const attachGoal = async (label: string) => {
    const goal = await prismaClient.goal.findFirstOrThrow({ where: { label } });

    await prismaClient.candicadiesOnGoals.upsert({
      where: {
        candidacyId_goalId: {
          candidacyId: candidacy.id,
          goalId: goal.id,
        },
      },
      update: {},
      create: { candidacyId: candidacy.id, goalId: goal.id },
    });
  };

  await Promise.all([
    attachGoal("Trouver plus facilement un emploi"),
    attachGoal("Être reconnu dans ma profession"),
  ]);

  await prismaClient.experience.create({
    data: {
      candidacyId: candidacy.id,
      title: "Chef de projet digital",
      description: "Pilotage d'équipes pluridisciplinaires",
      duration: ExperienceDuration.moreThanThreeYears,
      startedAt: new Date("2018-01-01T00:00:00.000Z"),
    },
  });

  await prismaClient.dFFPrerequisite.create({
    data: {
      dematerializedFeasibilityFileId,
      label: "Posséder un niveau B2 en anglais",
      state: PrerequisiteState.ACQUIRED,
    },
  });

  const attachBasicSkill = async (label: string) => {
    const basicSkill = await prismaClient.basicSkill.findFirstOrThrow({
      where: { label },
    });

    await prismaClient.basicSkillOnCandidacies.upsert({
      where: {
        basicSkillId_candidacyId: {
          basicSkillId: basicSkill.id,
          candidacyId: candidacy.id,
        },
      },
      update: {},
      create: { basicSkillId: basicSkill.id, candidacyId: candidacy.id },
    });
  };

  await attachBasicSkill(
    "Utilisation des règles de base de calcul et du raisonnement mathématique",
  );

  return { candidacyId: candidacy.id };
};

describe("demat feasibility pdf generation", () => {
  let canonicalPdfLines: string[] = [];
  let structuredSections: StructuredSection[] = [];

  const getSection = (sectionName: string) => {
    const section = structuredSections.find(({ name }) => name === sectionName);

    if (!section) {
      throw new Error(
        `Section "${sectionName}" introuvable dans la structure.`,
      );
    }

    return section;
  };

  const expectSectionText = (sectionName: string, expected: string) => {
    const section = getSection(sectionName);

    const actualLines = getCanonicalLines(section.lines.join("\n"));
    const expectedLines = getCanonicalLines(expected);

    if (actualLines.length === 0 || expectedLines.length === 0) {
      throw new Error(`La section "${sectionName}" ne contient aucune ligne.`);
    }

    const [actualTitle, ...actualBody] = actualLines;
    const [expectedTitle, ...expectedBody] = expectedLines;

    expect(actualTitle).toEqual(expectedTitle);
    expect({
      section: section.title,
      lines: [actualTitle, ...actualBody],
    }).toEqual({
      section: section.title,
      lines: [expectedTitle, ...expectedBody],
    });
  };

  beforeAll(async () => {
    const { candidacyId } = await setupCompleteDematerializedFeasibilityFile();

    const pdfBuffer = await generateFeasibilityFileByCandidacyId(candidacyId);

    expect(pdfBuffer).toBeInstanceOf(Buffer);

    if (!pdfBuffer) {
      throw new Error("No PDF buffer generated");
    }

    const pdfExtract = new PDFExtract();

    const extracted = await new Promise<ExtractedPdf>((resolve, reject) => {
      pdfExtract.extractBuffer(pdfBuffer, {}, (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data as ExtractedPdf);
      });
    });

    const textContent = extracted.pages
      .flatMap((page) => (page.content ?? []).map((item) => item.str ?? ""))
      .join("\n");

    canonicalPdfLines = canonicalizeText(textContent)
      .split("\n")
      .filter((line) => line.length > 0);

    const sectionStartIndices: number[] = [];
    let searchIndex = 0;

    SECTION_DEFINITIONS.forEach(({ title }) => {
      let foundIndex = -1;

      for (
        let index = searchIndex;
        index < canonicalPdfLines.length;
        index += 1
      ) {
        if (canonicalPdfLines[index] === title) {
          foundIndex = index;
          break;
        }
      }

      if (foundIndex === -1) {
        throw new Error(
          `Titre de section "${title}" introuvable dans le PDF extrait.`,
        );
      }

      sectionStartIndices.push(foundIndex);
      searchIndex = foundIndex + 1;
    });

    structuredSections = SECTION_DEFINITIONS.map((definition, index) => {
      const startIndex = sectionStartIndices[index];
      const endIndex =
        index === SECTION_DEFINITIONS.length - 1
          ? canonicalPdfLines.length
          : sectionStartIndices[index + 1];

      return {
        ...definition,
        startIndex,
        lines: canonicalPdfLines.slice(startIndex, endIndex),
      };
    });
  });

  it("contains the admissibility section", () => {
    expectSectionText(
      "admissibility",
      `
        Dossier de faisabilité
        Recevabilité du candidat
        ACCÈS AU DOSSIER DE FAISABILITÉ INTÉGRAL
        Date de fin de validité
        31/12/2025
        Le candidat s'engage à respecter le délai de fin de validité de la recevabilité
      `,
    );
  });

  it("contains the candidate section", () => {
    expectSectionText(
      "candidate",
      `
        M. Dupont Jean
        le : 20/05/1990 à Lyon, Paris (75)
        Nationalité Française
        Contact
        Adresse postale : 10 rue de Paris 75001 Paris
        Adresse électronique : jean.dupont@example.com
        Téléphone : 0601020304
      `,
    );
  });

  it("contains the educationLevel section", () => {
    expectSectionText(
      "educationLevel",
      `
        Niveau de formation
        Niveau de formation le plus élevé
        5
        Niveau de la certification obtenue la plus élevée
        7
        Intitulé de la certification la plus élevée obtenue
        Licence Informatique
      `,
    );
  });

  it("contains the certification section", () => {
    expectSectionText(
      "certification",
      `
        Certification visée
        Manager de la performance
        RNCP 99999
        Option ou parcours :
        Option Performance
        Langue vivante 1 :
        Anglais
        Langue vivante 2 :
        Espagnol
        La certification dans sa totalité
      `,
    );
  });

  it("contains the competenceBloc section", () => {
    expectSectionText(
      "competenceBloc",
      `
        Blocs de compétences
        BLOC-CODE - Bloc de compétences Gestion
        OUI
        Analyser des besoins clients
        Expérience significative en situation réelle
      `,
    );
  });

  it("contains the prerequisites section", () => {
    expectSectionText(
      "prerequisites",
      `
        Prérequis obligatoires
        Acquis
        Posséder un niveau B2 en anglais
      `,
    );
  });

  it("contains the experiences section", () => {
    expectSectionText(
      "experiences",
      `
        Expériences professionnelles
        Expérience 1 - Chef de projet digital
        Démarrée le 1 janvier 2018
        Expérience plus de 3 ans
        Pilotage d'équipes pluridisciplinaires
      `,
    );
  });

  it("contains the trainingPlan section", () => {
    expectSectionText(
      "trainingPlan",
      `
        Parcours envisagé
        Accompagnement individuel : 12h
        Accompagnement collectif : 6h
        Formation : 8h
        Formations obligatoires
        Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)
        Equipier de Première Intervention
      `,
    );
  });

  it("contains the basicSkills section", () => {
    expectSectionText(
      "basicSkills",
      `
        Savoir de base
        Communication en français
        Usage et communication numérique
        Utilisation des règles de base de calcul et du raisonnement mathématique
      `,
    );
  });

  it("contains the goals section", () => {
    expectSectionText(
      "goals",
      `
        Objectifs poursuivis par le candidat
        Trouver plus facilement un emploi
        Être reconnu dans ma profession
      `,
    );
  });

  it("contains the decision section", () => {
    expectSectionText(
      "decision",
      `
        Avis de faisabilité
        FAVORABLE
        Avis favorable pour la suite
      `,
    );
  });

  it("orders sections as expected", () => {
    const startIndexes = structuredSections.map(({ startIndex }) => startIndex);
    const sortedStartIndexes = [...startIndexes].sort((a, b) => a - b);

    expect(startIndexes).toEqual(sortedStartIndexes);
    expect(structuredSections.map(({ title }) => title)).toEqual(
      SECTION_DEFINITIONS.map(({ title }) => title),
    );
  });
});
