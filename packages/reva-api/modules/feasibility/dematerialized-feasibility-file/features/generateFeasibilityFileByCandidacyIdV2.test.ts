import { randomUUID } from "node:crypto";

import {
  CompetenceBlocsPartCompletionEnum,
  DFFCertificationCompetenceDetailsState,
  DFFDecision,
  DFFEligibilityRequirement,
  FeasibilityFormat,
  Gender,
  PrerequisiteState,
} from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCandidateHelper } from "@/test/helpers/entities/create-candidate-helper";
import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeasibilityDematerializedHelper } from "@/test/helpers/entities/create-feasibility-dematerialized-helper";
import {
  buildPdfTestHelper,
  SectionDefinition,
} from "@/test/helpers/pdf/pdfTestHelper";

import { generateFeasibilityFileByCandidacyIdV2 } from "./generateFeasibilityFileByCandidacyIdV2";

const SECTION_DEFINITIONS: ReadonlyArray<SectionDefinition> = [
  { name: "contexteDemande", title: "Nature de la demande" },
];

const setupCompleteDematerializedFeasibilityFile = async () => {
  const [parisDepartment, franceCountry] = await Promise.all([
    prismaClient.department.findFirstOrThrow({ where: { code: "75" } }),
    prismaClient.country.findFirstOrThrow({ where: { label: "France" } }),
  ]);

  const highestDegree = await prismaClient.degree.create({
    data: {
      code: randomUUID(),
      label: "Diplôme de niveau 2",
      longLabel: "Diplôme supérieur de niveau 2",
      level: 7,
    },
  });

  const educationDegree = await prismaClient.degree.create({
    data: {
      code: randomUUID(),
      label: "Diplôme de niveau 1",
      longLabel: "Diplôme supérieur de niveau 1",
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

  const certificationAuthorityStructure =
    await createCertificationAuthorityStructureHelper({
      label: "Ministère du test",
    });

  const certification = await createCertificationHelper({
    label: "Manager de la performance",
    rncpLabel: "Manager de la performance",
    feasibilityFormat: FeasibilityFormat.DEMATERIALIZED,
    certificationAuthorityStructureId: certificationAuthorityStructure.id,
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

  return { candidacyId: candidacy.id, certification };
};

describe("demat feasibility pdf generation", () => {
  let expectSectionText: (sectionName: string, expected: string) => void;
  let candidacyId: string;
  let rncpId: string;
  beforeAll(async () => {
    const setup = await setupCompleteDematerializedFeasibilityFile();
    candidacyId = setup.candidacyId;
    rncpId = setup.certification.rncpId;
    const pdfBuffer = await generateFeasibilityFileByCandidacyIdV2(candidacyId);

    expect(pdfBuffer).toBeInstanceOf(Buffer);

    if (!pdfBuffer) {
      throw new Error("No PDF buffer generated");
    }
    const pdfHelper = await buildPdfTestHelper({
      pdfBuffer,
      sectionDefinitions: SECTION_DEFINITIONS,
    });
    expectSectionText = pdfHelper.expectSectionText;
  });

  it("contains the admissibility section", () => {
    expectSectionText(
      "contexteDemande",
      `
        Nature de la demande
        ACCÈS AU DOSSIER DE FAISABILITÉ INTÉGRAL
        Informations sur la certification professionnelle visée
        VAE en autonomie
        RNCP ${rncpId}
        Manager de la performance
        Option ou parcours :
        Option Performance
        Langue vivante 1 :
        Anglais
        Langue vivante 2 :
        Espagnol
        Le candidat vise
        La certification dans sa totalité
        Choix des blocs de compétences
        BLOC-CODE - Bloc de compétences Gestion
        Pré-requis à la délivrance de la certification professionnelle visée
        Oui
        - Posséder un niveau B2 en anglais
        Non
      `,
    );
  });
});
