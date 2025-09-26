import { faker } from "@faker-js/faker";
import {
  CandidacyStatusStep,
  CertificationJuryFrequency,
  CertificationJuryModality,
  CertificationJuryTypeOfModality,
  CertificationStatus,
} from "@prisma/client";

import { graphql } from "@/modules/graphql/generated";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityHelper } from "@/test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationAuthorityStructureHelper } from "@/test/helpers/entities/create-certification-authority-structure-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createCCNHelper } from "@/test/helpers/entities/create-convention-collective-helper";
import { createFormaCodeHelper } from "@/test/helpers/entities/create-formacode-helper";
import { getGraphQLClient, getGraphQLError } from "@/test/test-graphql-client";

import { RNCPReferential } from "../rncp/referential";

const replaceCertificationMutation = graphql(`
  mutation ReplaceCertification($input: ReplaceCertificationInput!) {
    referential_replaceCertification(input: $input) {
      id
      status
      label
      codeRncp
      competenceBlocs {
        id
        code
        label
        competences {
          id
          label
        }
      }
      prerequisites {
        id
        label
        index
      }
    }
  }
`);

// Generate unique RNCP codes for each test run to avoid conflicts
const CURRENT_RNCP = `8${Date.now()}`;
const NEW_RNCP = `9${Date.now()}`;
const OTHER_RNCP = `9${Date.now() + 1}`;
const NEW_INTITULE = "Intitulé de certification";

async function createExistingCertification(rncpId = CURRENT_RNCP) {
  return createCertificationHelper({
    status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
    rncpId,
  });
}

async function createFormaCodeAndMockReferential() {
  const myFormaCode = await createFormaCodeHelper();
  vi.spyOn(RNCPReferential, "getInstance").mockImplementation(
    () =>
      ({
        findOneByRncp: () => ({
          ID_FICHE: "1234",
          NUMERO_FICHE: "1234",
          INTITULE: NEW_INTITULE,
          BLOCS_COMPETENCES: [
            {
              CODE: "BC01",
              LIBELLE: "Bloc 1",
              LISTE_COMPETENCES: "Liste des compétences",
              PARSED_COMPETENCES: ["Compétence 1", "Compétence 2"],
            },
          ],
          FORMACODES: [{ CODE: myFormaCode.code }],
          PREREQUIS: {
            PARSED_PREREQUIS: ["Prerequis 1", "Prerequis 2"],
            LISTE_PREREQUIS: "Liste des prérequis",
          },
          DATE_FIN_ENREGISTREMENT: new Date(),
          NOMENCLATURE_EUROPE: { INTITULE: "Niveau 4" },
        }),
      }) as unknown as RNCPReferential,
  );
}

async function createStructureWithCertification(certificationId: string) {
  return createCertificationAuthorityStructureHelper({
    certifications: {
      connect: { id: certificationId },
    },
  });
}

function getRegistryManagerGraphQLClient(
  certificationRegistryManager: {
    account: { keycloakId: string };
  } | null,
) {
  return getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_certification_registry",
        keycloakId: certificationRegistryManager?.account.keycloakId,
      }),
    },
  });
}

beforeEach(async () => {
  await prismaClient.certification.deleteMany({
    where: {
      rncpId: NEW_RNCP,
    },
  });
});

it("should add a new certification with the correct status", async () => {
  await createFormaCodeAndMockReferential();
  const existingCertification = await createExistingCertification();

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  const response = await graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: existingCertification.id,
    },
  });

  expect(response.referential_replaceCertification.status).toBe(
    CertificationStatus.A_VALIDER_PAR_CERTIFICATEUR,
  );
});

it("should add a new certification with the correct base and formacode info", async () => {
  await createFormaCodeAndMockReferential();
  const existingCertification = await createExistingCertification();

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  const response = await graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: existingCertification.id,
    },
  });

  const newCertification = response.referential_replaceCertification;

  expect(newCertification.codeRncp).toBe(NEW_RNCP);
  expect(newCertification.label).toBe(NEW_INTITULE);

  expect(newCertification.prerequisites).toHaveLength(2);
  expect(newCertification.competenceBlocs).toHaveLength(1);

  const formacodes = await prismaClient.certificationOnFormacode.findMany({
    where: { certificationId: newCertification.id },
  });
  expect(formacodes).toHaveLength(1);
});

it("should add a new certification linked to the previous one", async () => {
  await createFormaCodeAndMockReferential();
  const existingCertification = await createExistingCertification();

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  const response = await graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: existingCertification.id,
    },
  });

  const savedCertification = await prismaClient.certification.findUnique({
    where: { id: response.referential_replaceCertification.id },
  });

  expect(savedCertification?.previousVersionCertificationId).toBe(
    existingCertification.id,
  );

  expect(savedCertification?.firstVersionCertificationId).toBe(
    existingCertification.id,
  );
});

it("should carry over the first version certification id of the previous certification", async () => {
  await createFormaCodeAndMockReferential();

  const firstVersionCertification = await createCertificationHelper({
    status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
    rncpId: CURRENT_RNCP,
  });

  const existingCertification = await createExistingCertification();

  await prismaClient.certification.update({
    where: { id: existingCertification.id },
    data: {
      firstVersionCertificationId: firstVersionCertification.id,
    },
  });

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  const response = await graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: existingCertification.id,
    },
  });

  const savedCertification = await prismaClient.certification.findUnique({
    where: { id: response.referential_replaceCertification.id },
  });

  expect(savedCertification?.previousVersionCertificationId).toBe(
    existingCertification.id,
  );

  expect(savedCertification?.firstVersionCertificationId).toBe(
    firstVersionCertification.id,
  );
});

it("should copy all relationships and data from the previous certification", async () => {
  await createFormaCodeAndMockReferential();

  const linkToReferential = "Test linkToReferential";
  const certificationExpertContactDetails = "Test contact";
  const usefulResources = "Test usefulResources";

  const conventionCollective = await createCCNHelper();

  const juryInfo = {
    juryModalities: [
      CertificationJuryModality.PRESENTIEL,
      CertificationJuryModality.A_DISTANCE,
    ],
    juryTypeMiseEnSituationProfessionnelle:
      CertificationJuryTypeOfModality.PRESENTIEL,
    juryTypeSoutenanceOrale: CertificationJuryTypeOfModality.A_DISTANCE,
    juryFrequency: CertificationJuryFrequency.TRIMESTERLY,
    juryFrequencyOther: "Toutes les heures",
    juryEstimatedCost: 200,
  };

  const existingCertification = await createCertificationHelper({
    status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
    rncpId: CURRENT_RNCP,
    certificationOnConventionCollective: {
      create: {
        ccnId: conventionCollective.id,
      },
    },
    additionalInfo: {
      create: {
        linkToReferential,
        usefulResources,
        certificationExpertContactDetails,
      },
    },
    ...juryInfo,
  });

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  const certificationAuthority = await createCertificationAuthorityHelper({
    certificationAuthorityOnCertification: {
      create: {
        certificationId: existingCertification.id,
      },
    },
  });

  const localAccount = await createCertificationAuthorityLocalAccountHelper({
    certificationAuthorityId: certificationAuthority.id,
    certificationAuthorityLocalAccountOnCertification: {
      create: {
        certificationId: existingCertification.id,
      },
    },
  });

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  const response = await graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: existingCertification.id,
    },
  });

  const newCertification = response.referential_replaceCertification;

  const newCertificationWithRelations =
    await prismaClient.certification.findUnique({
      where: { id: newCertification.id },
      include: {
        additionalInfo: true,
      },
    });

  const newCertificationAuthorities =
    await prismaClient.certificationAuthorityOnCertification.findMany({
      where: { certificationId: newCertification.id },
    });

  const newLocalAccounts =
    await prismaClient.certificationAuthorityLocalAccountOnCertification.findMany(
      {
        where: { certificationId: newCertification.id },
      },
    );

  const newCertificationCollectives =
    await prismaClient.certificationOnConventionCollective.findMany({
      where: { certificationId: newCertification.id },
    });

  expect(newCertificationAuthorities[0]).toMatchObject({
    certificationAuthorityId: certificationAuthority.id,
  });

  expect(newLocalAccounts[0]).toMatchObject({
    certificationAuthorityLocalAccountId: localAccount.id,
  });

  expect(newCertificationCollectives[0]).toMatchObject({
    ccnId: conventionCollective.id,
  });

  expect({
    ...newCertificationWithRelations,
    juryEstimatedCost:
      newCertificationWithRelations?.juryEstimatedCost?.toNumber(),
  }).toMatchObject({
    feasibilityFormat: existingCertification.feasibilityFormat,
    certificationAuthorityStructureId:
      certificationRegistryManager?.certificationAuthorityStructureId,
    additionalInfo: {
      linkToReferential,
      usefulResources,
      certificationExpertContactDetails,
    },
    ...juryInfo,
  });
});

it("should throw an error if a certification with the same RNCP code already exists", async () => {
  await createExistingCertification();

  const certificationToReplace = await createCertificationHelper({
    status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
    rncpId: NEW_RNCP,
  });

  const { certificationRegistryManager } =
    await createStructureWithCertification(certificationToReplace.id);

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  const promise = graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP, // This code already exists
      certificationId: certificationToReplace.id,
    },
  });

  await expect(promise).rejects.toThrow(
    getGraphQLError(
      `Une certification avec le code RNCP ${NEW_RNCP} existe déjà`,
    ),
  );
});

it("should throw an error if certification to replace does not exist", async () => {
  // It's an admin specific test (registry manager security checks are based an existing certifications)
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
      }),
    },
  });

  const nonExistentId = faker.string.uuid();

  const promise = graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: nonExistentId,
    },
  });

  await expect(promise).rejects.toThrow(
    getGraphQLError(`La certification avec l'ID ${nonExistentId} n'existe pas`),
  );
});

it("should throw an error if RNCP certification does not exist", async () => {
  const existingCertification = await createExistingCertification();

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  vi.spyOn(RNCPReferential, "getInstance").mockImplementation(
    () =>
      ({
        findOneByRncp: () => null,
      }) as unknown as RNCPReferential,
  );

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  const promise = graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: OTHER_RNCP,
      certificationId: existingCertification.id,
    },
  });

  await expect(promise).rejects.toThrow(
    getGraphQLError(
      `La certification avec le code RNCP ${OTHER_RNCP} n'existe pas dans le référentiel RNCP`,
    ),
  );
});

it("should throw an error if a more recent version already exists", async () => {
  await createFormaCodeAndMockReferential();
  const existingCertification = await createExistingCertification();

  await createCertificationHelper({
    status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
    rncpId: OTHER_RNCP,
    previousVersionCertificationId: existingCertification.id,
  });

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );
  const promise = graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: existingCertification.id,
    },
  });

  await expect(promise).rejects.toThrow(
    getGraphQLError(
      "Une version plus récente de cette certification existe déjà",
    ),
  );
});

it("should remove certification from candidacies in PROJET status", async () => {
  await createFormaCodeAndMockReferential();
  const existingCertification = await createExistingCertification();

  const { certificationRegistryManager } =
    await createStructureWithCertification(existingCertification.id);

  const [candidacyProjet, candidacyProjet2] = await Promise.all([
    createCandidacyHelper({
      certificationId: existingCertification.id,
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    }),
    createCandidacyHelper({
      certificationId: existingCertification.id,
      candidacyActiveStatus: CandidacyStatusStep.PROJET,
    }),
  ]);

  const graphqlClient = getRegistryManagerGraphQLClient(
    certificationRegistryManager,
  );

  await graphqlClient.request(replaceCertificationMutation, {
    input: {
      codeRncp: NEW_RNCP,
      certificationId: existingCertification.id,
    },
  });

  const [updatedCandidacyProjet, updatedCandidacyProjet2] = await Promise.all([
    prismaClient.candidacy.findUnique({ where: { id: candidacyProjet.id } }),
    prismaClient.candidacy.findUnique({ where: { id: candidacyProjet2.id } }),
  ]);

  expect(updatedCandidacyProjet?.certificationId).toBeNull();
  expect(updatedCandidacyProjet?.organismId).toBeNull();
  expect(updatedCandidacyProjet2?.certificationId).toBeNull();
  expect(updatedCandidacyProjet2?.organismId).toBeNull();
});

const nonProjetStatuses = Object.values(CandidacyStatusStep).filter(
  (status) => status !== CandidacyStatusStep.PROJET,
) as CandidacyStatusStep[];

it.each(nonProjetStatuses)(
  "should keep certification for candidacies in %s status",
  async (status: CandidacyStatusStep) => {
    await createFormaCodeAndMockReferential();
    const existingCertification = await createExistingCertification();

    const { certificationRegistryManager } =
      await createStructureWithCertification(existingCertification.id);

    const candidacy = await createCandidacyHelper({
      certificationId: existingCertification.id,
      candidacyActiveStatus: status,
    });

    const graphqlClient = getRegistryManagerGraphQLClient(
      certificationRegistryManager,
    );

    await graphqlClient.request(replaceCertificationMutation, {
      input: {
        codeRncp: NEW_RNCP,
        certificationId: existingCertification.id,
      },
    });

    const notUpdatedCandidacy = await prismaClient.candidacy.findUnique({
      where: { id: candidacy.id },
    });

    expect(notUpdatedCandidacy?.certificationId).toBe(existingCertification.id);
    expect(notUpdatedCandidacy?.organismId).toBe(candidacy.organismId);
  },
);
