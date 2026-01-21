import { randomUUID } from "node:crypto";

import {
  CandidateTypology,
  CompetenceBlocsPartCompletionEnum,
  DFFCertificationCompetenceDetailsState,
  DFFDecision,
  DFFEligibilityRequirement,
  ExperienceDuration,
  FeasibilityFormat,
  Gender,
  PrerequisiteState,
} from "@prisma/client";

import { prismaClient } from "@/prisma/client";
import { createCandidacyCCNHelper } from "@/test/helpers/entities/create-candidacy-ccn-helper";
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
  { name: "contextDemande", title: "Contexte de la demande" },
  { name: "natureDemande", title: "Nature de la demande" },
  {
    name: "infosCertification",
    title: "Informations sur la certification professionnelle visée",
  },
  {
    name: "prerequisCertification",
    title:
      "Pré-requis à la délivrance de la certification professionnelle visée",
  },
  {
    name: "profilCandidat",
    title: "Profil du candidat",
  },
  {
    name: "informationsCandidat",
    title: "Informations sur le candidat",
  },
  {
    name: "niveauFormation",
    title: "Niveau de formation",
  },
  {
    name: "informationsContactCandidat",
    title: "Informations de contact du candidat",
  },
  {
    name: "statut",
    title: "Statut",
  },
  {
    name: "objectifsCandidat",
    title: "Objectifs du candidat",
  },
  {
    name: "experiences",
    title: "Expériences",
  },
  {
    name: "informationsReferentiel",
    title:
      "Informations sur les expériences du candidat en lien avec le référentiel d’activités et",
  },
  {
    name: "accompagnementCandidat",
    title: "Accompagnement proposé au candidat",
  },
  {
    name: "preconisationAccompagnementMethodologique",
    title: "Préconisation accompagnement méthodologique",
  },
  {
    name: "preconisationActesFormatifs",
    title: "Préconisation actes formatifs",
  },
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

  const ccn = await createCandidacyCCNHelper({ label: "Ma CCN" });

  const candidacy = await createCandidacyHelper({
    certificationId: certification.id,
    candidacyArgs: {
      candidateId: candidate.id,
      additionalHourCount: 8,
      individualHourCount: 12,
      collectiveHourCount: 6,
      typology: CandidateTypology.SALARIE_PRIVE,
      ccnId: ccn.id,
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

  await prismaClient.experience.create({
    data: {
      candidacyId: candidacy.id,
      title: "Chef de projet digital",
      description: "Pilotage d'équipes pluridisciplinaires",
      duration: ExperienceDuration.moreThanThreeYears,
      startedAt: new Date("2018-01-01T00:00:00.000Z"),
    },
  });

  await attachGoal("Trouver plus facilement un emploi");
  await attachGoal("Être reconnu dans ma profession");

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
  describe("contexte de la demande section", () => {
    it("contains the 'nature de la demande' subsection", () => {
      expectSectionText(
        "natureDemande",
        `
        Nature de la demande
        ACCÈS AU DOSSIER DE FAISABILITÉ INTÉGRAL
      `,
      );
    });
    it("contains the 'Informations sur la certification professionnelle visée' subsection", () => {
      expectSectionText(
        "infosCertification",
        `
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
      `,
      );
    });
    it("contains the 'Pré-requis à la délivrance de la certification professionnelle visée' certification subsection", () => {
      expectSectionText(
        "prerequisCertification",
        `
        Pré-requis à la délivrance de la certification professionnelle visée
        Oui
        - Posséder un niveau B2 en anglais
        Non
      `,
      );
    });
  });

  describe("profil candidat section", () => {
    it("contains the 'Informations sur le candidat' subsection", () => {
      expectSectionText(
        "informationsCandidat",
        `
        Informations sur le candidat
        Civilité :
        Monsieur
        Nom de naissance :
        Dupont
        Prénoms :
        Jean
        Date de naissance :
        20/05/1990
        Ville de naissance :
        Lyon
        Nationalité :
        Française
      `,
      );
    });
    it("contains the 'Niveau de formation' certification subsection", () => {
      expectSectionText(
        "niveauFormation",
        `
        Niveau de formation
        Niveau de formation le plus élevé :
        5
        Niveau de la certification obtenue la plus élevée :
        7
        Intitulé de la certification la plus élevée obtenue :
        Licence Informatique
      `,
      );
    });
    it("contains the 'Informations de contact du candidat' certification subsection", () => {
      expectSectionText(
        "informationsContactCandidat",
        `
        Informations de contact du candidat
        Adresse postale :
        10 rue de Paris 75001 Paris, France
        Adresse électronique :
        jean.dupont@example.com
        Téléphone :
        0601020304
      `,
      );
    });
    it("contains the 'Statut' certification subsection", () => {
      expectSectionText(
        "statut",
        `
        Statut
        Salarié du secteur privé
        Identifiant de la Convention collective de l’employeur du candidat
        Ma CCN
      `,
      );
    });
    it("contains the 'Objectifs du candidat' certification subsection", () => {
      expectSectionText(
        "objectifsCandidat",
        `
        Objectifs du candidat
        - Trouver plus facilement un emploi
        - Être reconnu dans ma profession
      `,
      );
    });
    it("contains the 'Expériences' certification subsection", () => {
      expectSectionText(
        "experiences",
        `
        Expériences
        Chef de projet digital
        Pilotage d'équipes pluridisciplinaires
        Expérience de plus de 3 ans
        Démarrée le 01/01/2018

      `,
      );
    });

    it("contains the 'Informations sur les expériences du candidat en lien avec le référentiel d’activités et de compétences' certification subsection", () => {
      expectSectionText(
        "informationsReferentiel",
        `
        Informations sur les expériences du candidat en lien avec le référentiel d’activités et
        de compétences
        BLOC-CODE - Bloc de compétences Gestion
        OUI
        Analyser des besoins clients
        Commentaire sur le bloc
        Expérience significative en situation réelle
      `,
      );
    });

    it("contains the 'Préconisation accompagnement méthodologique' certification subsection", () => {
      expectSectionText(
        "preconisationAccompagnementMethodologique",
        `
        Préconisation accompagnement méthodologique
        Accompagnement individuel :
        12h
        Accompagnement collectif :
        6h
        Formation :
        8h
      `,
      );
    });

    it("contains the 'Préconisation actes formatifs' certification subsection", () => {
      expectSectionText(
        "preconisationActesFormatifs",
        `
        Préconisation actes formatifs
        Formations obligatoires
        - Attestation de Formation aux Gestes et Soins d'Urgence (AFGSU 2)
        - Equipier de Première Intervention
        Savoirs de base
        - Communication en français
        - Usage et communication numérique
        - Utilisation des règles de base de calcul et du raisonnement mathématique
      `,
      );
    });
  });
});
