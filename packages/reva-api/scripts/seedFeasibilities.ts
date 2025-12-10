import { createReadStream, readFileSync } from "fs";
import path from "path";

import { faker } from "@faker-js/faker";
import {
  FeasibilityFormat,
  FeasibilityStatus,
  DFFCertificationCompetenceDetailsState,
  PrerequisiteState,
  CandidacyStatusStep,
  CandidateTypology,
  FinanceModule,
  Gender,
  ExperienceDuration,
} from "@prisma/client";
import dotenv from "dotenv";

import { sendDossierDeValidation } from "@/modules/dossier-de-validation/features/sendDossierDeValidation";
import { createOrUpdateAttachments } from "@/modules/feasibility/dematerialized-feasibility-file/features/createOrUpdateAttachments";
import { addCertification } from "@/modules/referential/features/addCertification";

import { prismaClient } from "../prisma/client";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const FEASIBILITY_STATUSES: FeasibilityStatus[] = [
  "PENDING",
  "REJECTED",
  "ADMISSIBLE",
  "INCOMPLETE",
  "COMPLETE",
];

const COMPETENCE_DETAILS_STATES: DFFCertificationCompetenceDetailsState[] = [
  "YES",
  "NO",
  "PARTIALLY",
];

const CERTIFICATION_RNCP_IDS = [
  "36004",
  "34824",
  "37675",
  "39793",
  "35832",
  "40743",
  "35830",
  "40692",
  "39644",
  "34827",
  "37679",
  "39645",
  "36836",
  "4503",
  "39680",
];
const CERTIFICATION_AUTHORITY_ID = "4270391e-1beb-4366-87fd-76c6b23a47df";
const COUNTRY_ID = "4a92a738-d112-413b-aa9a-5bc9c3cf2dc9";
const BIRTH_DEPARTMENT_ID = "80748231-b32f-40cc-a2d1-ffa0157688b7";
const HIGHEST_DEGREE_ID = "60417556-0424-4683-9d16-70fa75d7a26d";
const NIVEAU_DE_FORMATION_LE_PLUS_ELEVE_DEGREE_ID =
  "e93d52ce-dba2-4c3e-8354-5ba504e9f5e5";
const NATIONALITY = "France";
const NUMBER_OF_FEASIBILITIES_TO_CREATE = 50;

const dossierDeValidationFile = readFileSync(
  path.join(process.cwd(), "scripts/dossier_validation.pdf"),
);

const createFeasibilities = async (certificationRncpId: string) => {
  // Verify certification authority exists
  const certificationAuthority =
    await prismaClient.certificationAuthority.findUnique({
      where: { id: CERTIFICATION_AUTHORITY_ID },
    });

  if (!certificationAuthority) {
    throw new Error(
      `Certification authority with id ${CERTIFICATION_AUTHORITY_ID} not found`,
    );
  }
  console.log(
    `Starting feasibility seeding for certification ${certificationRncpId} and certification authority ${certificationAuthority.label}...`,
  );

  // Find the certification
  let certification = await prismaClient.certification.findUnique({
    where: { rncpId: certificationRncpId },
    include: {
      competenceBlocs: {
        include: {
          competences: true,
        },
      },
      prerequisites: true,
    },
  });

  if (!certification) {
    console.warn(
      `⚠️ Certification with rncp_id ${certificationRncpId} not found, attempting to retrieve it from France compétences and save it...`,
    );
    await addCertification({ codeRncp: certificationRncpId });
    certification = await prismaClient.certification.update({
      data: {
        status: "VALIDE_PAR_CERTIFICATEUR",
        visible: true,
      },
      where: { rncpId: certificationRncpId },
      include: {
        competenceBlocs: {
          include: {
            competences: true,
          },
        },
        prerequisites: true,
      },
    });
    if (!certification) {
      throw new Error(
        `Certification with rncp_id ${certificationRncpId} not found after retrieval from France compétences`,
      );
    }
    console.log(
      `📜 Certification with rncp_id ${certificationRncpId} added from France compétences`,
    );
  }

  // Verify country exists
  const country = await prismaClient.country.findUnique({
    where: { id: COUNTRY_ID },
  });

  if (!country) {
    throw new Error(`Country with id ${COUNTRY_ID} not found`);
  }

  // Verify birth department exists
  const birthDepartment = await prismaClient.department.findUnique({
    where: { id: BIRTH_DEPARTMENT_ID },
  });

  if (!birthDepartment) {
    throw new Error(
      `Birth department with id ${BIRTH_DEPARTMENT_ID} not found`,
    );
  }

  // Verify highest degree exists
  const highestDegree = await prismaClient.degree.findUnique({
    where: { id: HIGHEST_DEGREE_ID },
  });

  if (!highestDegree) {
    throw new Error(`Highest degree with id ${HIGHEST_DEGREE_ID} not found`);
  }

  // Get a department for candidate address (use birth department as fallback)
  const department = await prismaClient.department.findFirst({
    where: { id: { not: BIRTH_DEPARTMENT_ID } },
  });

  const candidateDepartmentId = department?.id ?? BIRTH_DEPARTMENT_ID;

  // Get an organism (or create one if needed)
  let organism = await prismaClient.organism.findFirst();

  if (!organism) {
    // Create a basic organism if none exists
    organism = await prismaClient.organism.create({
      data: {
        label: faker.company.name(),
        siret: faker.string.numeric(14),
        contactAdministrativeEmail: faker.internet.email(),
        contactAdministrativePhone: faker.phone.number(),
        modaliteAccompagnementRenseigneeEtValide: true,
        modaliteAccompagnement: "A_DISTANCE",
        typology: "expertBrancheEtFiliere",
      },
    });
  }

  // Get basic skills for candidacy
  const basicSkills = await prismaClient.basicSkill.findMany({ take: 2 });

  if (basicSkills.length === 0) {
    throw new Error("No basic skills found. Please seed basic skills first.");
  }

  console.log(
    `Found certification with ${certification.competenceBlocs.length} competence blocs and ${certification.prerequisites.length} prerequisites`,
  );

  // Create 50 feasibilities
  for (let i = 0; i < NUMBER_OF_FEASIBILITIES_TO_CREATE; i++) {
    console.log(`Creating feasibility ${i + 1}/50...`);

    // Random feasibility status
    const feasibilityStatus = faker.helpers.arrayElement(FEASIBILITY_STATUSES);

    // Create candidate
    const candidate = await prismaClient.candidate.create({
      data: {
        firstname: faker.person.firstName(),
        lastname: faker.person.lastName(),
        email: faker.internet.email(),
        gender: faker.helpers.arrayElement([
          Gender.man,
          Gender.woman,
          Gender.undisclosed,
        ]),
        keycloakId: faker.string.uuid(),
        firstname2: faker.helpers.maybe(() => faker.person.middleName()),
        firstname3: faker.helpers.maybe(() => faker.person.middleName()),
        phone: faker.helpers.fromRegExp(/0[1-9]{9}/),
        birthdate: faker.date.birthdate({ min: 18, max: 65, mode: "age" }),
        birthCity: faker.location.city(),
        nationality: NATIONALITY,
        highestDegreeLabel: faker.lorem.words(3),
        street: faker.location.streetAddress(),
        city: faker.location.city(),
        zip: faker.location.zipCode("#####"),
        addressComplement: faker.helpers.maybe(() => faker.lorem.word()),
        givenName: faker.helpers.maybe(() => faker.person.fullName()),
        departmentId: candidateDepartmentId,
        countryId: COUNTRY_ID,
        birthDepartmentId: BIRTH_DEPARTMENT_ID,
        highestDegreeId: HIGHEST_DEGREE_ID,
        niveauDeFormationLePlusEleveDegreeId:
          NIVEAU_DE_FORMATION_LE_PLUS_ELEVE_DEGREE_ID,
      },
    });

    let candidacyStatus: CandidacyStatusStep =
      CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE;
    if (feasibilityStatus === "ADMISSIBLE") {
      candidacyStatus = CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE;
    } else if (feasibilityStatus === "REJECTED") {
      candidacyStatus = CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE;
    } else if (feasibilityStatus === "COMPLETE") {
      candidacyStatus = CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET;
    } else if (feasibilityStatus === "INCOMPLETE") {
      candidacyStatus = CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET;
    }

    // Create candidacy
    const candidacy = await prismaClient.candidacy.create({
      data: {
        candidateId: candidate.id,
        organismId: organism.id,
        certificationId: certification.id,
        isCertificationPartial: false,
        feasibilityFormat: FeasibilityFormat.DEMATERIALIZED,
        typology: faker.helpers.arrayElement([
          CandidateTypology.SALARIE_PRIVE,
          CandidateTypology.SALARIE_PUBLIC,
          CandidateTypology.DEMANDEUR_EMPLOI,
          CandidateTypology.NON_SPECIFIE,
        ]),
        experiences: {
          create: {
            title: `Expérience - ${faker.lorem.word()}`,
            description: faker.lorem.sentence(),
            duration: faker.helpers.arrayElement(
              Object.values(ExperienceDuration),
            ),
            startedAt: faker.date.past({
              years: 10,
            }),
          },
        },
        financeModule: FinanceModule.unifvae,
        status: candidacyStatus,
        candidacyStatuses: {
          create: {
            status: CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
          },
        },
        basicSkills: {
          createMany: {
            data: basicSkills.map((skill) => ({
              basicSkillId: skill.id,
            })),
          },
        },
      },
    });

    // Create feasibility with dematerialized file
    const feasibility = await prismaClient.feasibility.create({
      data: {
        candidacyId: candidacy.id,
        certificationAuthorityId: CERTIFICATION_AUTHORITY_ID,
        decision: feasibilityStatus,
        feasibilityFormat: FeasibilityFormat.DEMATERIALIZED,
        feasibilityFileSentAt: faker.date.past(),
        decisionSentAt:
          feasibilityStatus !== "PENDING"
            ? faker.date.recent({ days: 30 })
            : null,
        decisionComment:
          feasibilityStatus !== "PENDING" ? faker.lorem.sentence() : null,
        isActive: true,
        dematerializedFeasibilityFile: {
          create: {
            firstForeignLanguage: faker.helpers.maybe(() => faker.lorem.word()),
            secondForeignLanguage: faker.helpers.maybe(() =>
              faker.lorem.word(),
            ),
            option: faker.helpers.maybe(() => faker.lorem.word()),
            certificationPartComplete: true,
            prerequisitesPartComplete: true,
            attachmentsPartComplete: true,
            competenceBlocsPartCompletion: "COMPLETED",
            aapDecision: "FAVORABLE",
            eligibilityRequirement: "FULL_ELIGIBILITY_REQUIREMENT",
          },
        },
      },
      include: {
        dematerializedFeasibilityFile: true,
      },
    });

    const dematerializedFeasibilityFile =
      feasibility.dematerializedFeasibilityFile;

    if (!dematerializedFeasibilityFile) {
      throw new Error("Failed to create dematerialized feasibility file");
    }

    // Create competence bloc entries
    for (const bloc of certification.competenceBlocs) {
      await prismaClient.dFFCertificationCompetenceBloc.create({
        data: {
          dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
          certificationCompetenceBlocId: bloc.id,
          text: faker.lorem.paragraphs(2),
          complete: true,
        },
      });

      // Create competence details for each competence in the bloc
      for (const competence of bloc.competences) {
        await prismaClient.dFFCertificationCompetenceDetails.create({
          data: {
            dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
            certificationCompetenceId: competence.id,
            state: faker.helpers.arrayElement(COMPETENCE_DETAILS_STATES),
          },
        });
      }
    }

    // Create prerequisite entries
    for (const prerequisite of certification.prerequisites) {
      await prismaClient.dFFPrerequisite.create({
        data: {
          dematerializedFeasibilityFileId: dematerializedFeasibilityFile.id,
          label: prerequisite.label,
          state: PrerequisiteState.ACQUIRED,
          certificationPrerequisiteId: prerequisite.id,
        },
      });
    }

    // Create and upload ID file and PDF version of the feasibility file
    await createOrUpdateAttachments({
      candidacyId: candidacy.id,
      input: {
        idCard: Promise.resolve({
          filename: "document.pdf",
          mimetype: "application/pdf",
          createReadStream: () =>
            createReadStream(path.join(process.cwd(), "scripts/document.pdf")),
        }),
      },
    });

    if (feasibilityStatus === "ADMISSIBLE") {
      console.log(
        "Feasibility is admissible, creating Dossier de validation...",
      );
      await sendDossierDeValidation({
        candidacyId: candidacy.id,
        dossierDeValidationFile: {
          filename: "dossier_validation.pdf",
          mimetype: "application/pdf",
          _buf: dossierDeValidationFile,
        },
        dossierDeValidationOtherFiles: [],
        userKeycloakId: candidate.keycloakId,
        userEmail: candidate.email,
        userRoles: ["candidate"],
      });
    }

    console.log(
      `✅ Created feasibility ${i + 1}/${NUMBER_OF_FEASIBILITIES_TO_CREATE} with status ${feasibilityStatus}. Candidacy id : ${candidacy.id}. RNCP id : ${certificationRncpId}`,
    );
  }

  console.log(
    `✅ Feasibility seeding completed successfully for certification ${certificationRncpId} and certification authority ${certificationAuthority.label}!`,
  );
};

const main = async () => {
  for (const certificationRncpId of CERTIFICATION_RNCP_IDS) {
    try {
      await createFeasibilities(certificationRncpId);
    } catch (error) {
      console.error(
        `❌ Error seeding feasibilities for certification ${certificationRncpId}:`,
        error,
      );
    }
  }
};

main()
  .catch((error) => {
    console.error("❌ Error seeding feasibilities:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
