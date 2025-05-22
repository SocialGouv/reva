import { faker } from "@faker-js/faker";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createCertificationHelper } from "../../../test/helpers/entities/create-certification-helper";
import { createCertificationAuthorityStructureHelper } from "../../../test/helpers/entities/create-certification-authority-structure-helper";
import { createCertificationAuthorityLocalAccountHelper } from "../../../test/helpers/entities/create-certification-authority-local-account-helper";
import { createFormaCodeHelper } from "../../../test/helpers/entities/create-formacode-helper";

import {
  getGraphQLClient,
  getGraphQLError,
} from "../../../test/jestGraphqlClient";
import { RNCPReferential } from "../rncp/referential";
import { prismaClient } from "../../../prisma/client";
import { graphql } from "../../graphql/generated";
import { CertificationStatus } from "@prisma/client";

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

const CURRENT_RNCP = "8000";
const NEW_RNCP = "9000";
const NEW_INTITULE = "Intitulé de certification";

async function createFormaCode() {
  const myFormaCode = await createFormaCodeHelper();
  jest.spyOn(RNCPReferential, "getInstance").mockImplementation(
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

describe("API - replaceCertification", () => {
  beforeEach(async () => {
    await prismaClient.certification.deleteMany({
      where: {
        rncpId: NEW_RNCP,
      },
    });
  });

  it("should add a new certification linked to the previous one", async () => {
    await createFormaCode();

    // Create a certification and a registry manager linked to it
    const existingCertification = await createCertificationHelper({
      status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
      rncpId: CURRENT_RNCP,
    });

    const { certificationRegistryManager } =
      await createCertificationAuthorityStructureHelper({
        certifications: {
          connect: { id: existingCertification.id },
        },
      });

    // Make the GraphQL request with proper authorization
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_certification_registry",
          keycloakId: certificationRegistryManager?.account.keycloakId,
        }),
      },
    });

    const response = await graphqlClient.request(replaceCertificationMutation, {
      input: {
        codeRncp: NEW_RNCP,
        certificationId: existingCertification.id,
      },
    });

    const newCertification = response.referential_replaceCertification;

    expect(newCertification).toBeDefined();
    expect(newCertification.status).toBe(
      CertificationStatus.A_VALIDER_PAR_CERTIFICATEUR,
    );
    expect(newCertification.codeRncp).toBe(NEW_RNCP);
    expect(newCertification.label).toBe(NEW_INTITULE);

    // Check previousVersionCertificationId with a direct database query
    const savedCertification = await prismaClient.certification.findUnique({
      where: { id: newCertification.id },
    });
    expect(savedCertification?.previousVersionCertificationId).toBe(
      existingCertification.id,
    );

    expect(newCertification.prerequisites).toHaveLength(2);
    // expect(newCertification.competenceBlocs).toHaveLength(1);

    // Check formacodes with a direct database query
    const formacodes = await prismaClient.certificationOnFormacode.findMany({
      where: { certificationId: newCertification.id },
    });
    expect(formacodes).toHaveLength(1);
  });

  it("should copy all relationships and data from the previous certification", async () => {
    // Create the old certification
    const existingCertification = await createCertificationHelper({
      status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
      rncpId: CURRENT_RNCP,
    });

    // Create authority structure with proper access
    const { certificationRegistryManager } =
      await createCertificationAuthorityStructureHelper({
        certifications: {
          connect: { id: existingCertification.id },
        },
      });

    // 1. Create and link certification authorities
    const certificationAuthority =
      await prismaClient.certificationAuthority.create({
        data: {
          label: "Test Authority",
          contactEmail: "test@authority.com",
        },
      });
    await prismaClient.certificationAuthorityOnCertification.create({
      data: {
        certificationId: existingCertification.id,
        certificationAuthorityId: certificationAuthority.id,
      },
    });

    // 2. Create and link certification authority local account
    const localAccount = await createCertificationAuthorityLocalAccountHelper({
      certificationAuthorityId: certificationAuthority.id,
    });

    await prismaClient.certificationAuthorityLocalAccountOnCertification.create(
      {
        data: {
          certificationId: existingCertification.id,
          certificationAuthorityLocalAccountId: localAccount.id,
        },
      },
    );

    // 3. Create and link convention collective
    const conventionCollective = await prismaClient.conventionCollective.create(
      {
        data: {
          code: "1234",
          label: "Test Convention",
        },
      },
    );
    await prismaClient.certificationOnConventionCollective.create({
      data: {
        certificationId: existingCertification.id,
        ccnId: conventionCollective.id,
      },
    });

    // 4. Create additional info
    const additionalInfo =
      await prismaClient.certificationAdditionalInfo.create({
        data: {
          certificationId: existingCertification.id,
          linkToReferential: "Test Goals", // Required field
          usefulResources: "Test Resources",
          certificationExpertContactDetails: "Test Contact",
        },
      });

    // Execute the replacement
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_certification_registry",
          keycloakId: certificationRegistryManager?.account.keycloakId,
        }),
      },
    });

    const response = await graphqlClient.request(replaceCertificationMutation, {
      input: {
        codeRncp: NEW_RNCP,
        certificationId: existingCertification.id,
      },
    });

    const newCertification = response.referential_replaceCertification;

    // Verify the new certification was created with copied data
    const newCertificationWithRelations =
      await prismaClient.certification.findUnique({
        where: { id: newCertification.id },
        include: {
          additionalInfo: true,
          _count: {
            select: {
              certificationOnConventionCollective: true,
            },
          },
        },
      });

    // Get the related certification authorities
    const newCertificationAuthorities =
      await prismaClient.certificationAuthorityOnCertification.findMany({
        where: { certificationId: newCertification.id },
      });

    // Get the related certification authority local accounts
    const newLocalAccounts =
      await prismaClient.certificationAuthorityLocalAccountOnCertification.findMany(
        {
          where: { certificationId: newCertification.id },
        },
      );

    // Get the related convention collectives
    const newCertificationCollectives =
      await prismaClient.certificationOnConventionCollective.findMany({
        where: { certificationId: newCertification.id },
      });

    // Verify certification authorities were copied
    expect(newCertificationAuthorities).toHaveLength(1);
    expect(newCertificationAuthorities[0].certificationAuthorityId).toBe(
      certificationAuthority.id,
    );

    // Verify certification authority local accounts were copied
    expect(newLocalAccounts).toHaveLength(1);
    expect(newLocalAccounts[0].certificationAuthorityLocalAccountId).toBe(
      localAccount.id,
    );

    // Verify convention collectives were copied
    expect(newCertificationCollectives).toHaveLength(1);
    expect(newCertificationCollectives[0].ccnId).toBe(conventionCollective.id);

    // Verify additional information was copied
    expect(newCertificationWithRelations?.additionalInfo).toBeDefined();
    expect(
      newCertificationWithRelations?.additionalInfo?.linkToReferential,
    ).toBe("Test Goals");
    expect(newCertificationWithRelations?.additionalInfo?.usefulResources).toBe(
      "Test Resources",
    );
    expect(
      newCertificationWithRelations?.additionalInfo
        ?.certificationExpertContactDetails,
    ).toBe("Test Contact");

    // Verify the inherited fields from the original certification
    expect(newCertificationWithRelations?.feasibilityFormat).toBe(
      existingCertification.feasibilityFormat,
    );

    // Get the updated certification with structure ID
    const updatedOriginalCert = await prismaClient.certification.findUnique({
      where: { id: existingCertification.id },
    });

    expect(
      newCertificationWithRelations?.certificationAuthorityStructureId,
    ).toBe(updatedOriginalCert?.certificationAuthorityStructureId);

    // Arrays and objects should use toEqual instead of toBe
    expect(newCertificationWithRelations?.juryModalities).toEqual(
      existingCertification.juryModalities,
    );
    expect(
      newCertificationWithRelations?.juryTypeMiseEnSituationProfessionnelle,
    ).toBe(existingCertification.juryTypeMiseEnSituationProfessionnelle);
    expect(newCertificationWithRelations?.juryTypeSoutenanceOrale).toBe(
      existingCertification.juryTypeSoutenanceOrale,
    );
    expect(newCertificationWithRelations?.juryFrequency).toBe(
      existingCertification.juryFrequency,
    );
    expect(newCertificationWithRelations?.juryFrequencyOther).toBe(
      existingCertification.juryFrequencyOther,
    );
    expect(newCertificationWithRelations?.juryPlace).toBe(
      existingCertification.juryPlace,
    );
    expect(newCertificationWithRelations?.juryEstimatedCost).toBe(
      existingCertification.juryEstimatedCost,
    );
  });

  it("should throw an error if certification with same RNCP code already exists", async () => {
    // Create existing certification with the target RNCP code
    await createCertificationHelper({
      status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
      rncpId: CURRENT_RNCP,
    });

    // Create the certification we want to replace
    const certificationToReplace = await createCertificationHelper({
      status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
      rncpId: NEW_RNCP,
    });

    // Create authority structure with proper access
    const { certificationRegistryManager } =
      await createCertificationAuthorityStructureHelper({
        certifications: {
          connect: { id: certificationToReplace.id },
        },
      });

    // Set up GraphQL client
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_certification_registry",
          keycloakId: certificationRegistryManager?.account.keycloakId,
        }),
      },
    });

    const promise = graphqlClient.request(replaceCertificationMutation, {
      input: {
        codeRncp: NEW_RNCP, // This code already exists
        certificationId: certificationToReplace.id,
      },
    });

    await expect(promise).rejects.toThrow(
      getGraphQLError("Une certification avec le code RNCP 9000 existe déjà"),
    );
  });

  it("should throw an error if certification to replace does not exist", async () => {
    // Admin users bypass security checks, so we can test the existence check correctly
    // In a real-world scenario, security checks would happen first, but we want to
    // isolate and test just the "certification not found" error

    // Use a proper random UUID that doesn't exist
    const nonExistentId = faker.string.uuid();

    // Set up GraphQL client with admin permissions
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "admin",
        }),
      },
    });

    // Make the request with a non-existent certification ID
    const promise = graphqlClient.request(replaceCertificationMutation, {
      input: {
        codeRncp: "RNCP-TEST-4",
        certificationId: nonExistentId,
      },
    });

    // Verify the expected error
    await expect(promise).rejects.toThrow(
      getGraphQLError(
        `La certification avec l'ID ${nonExistentId} n'existe pas`,
      ),
    );
  });

  it("should throw an error if RNCP certification does not exist", async () => {
    // Create a certification to replace
    const existingCertification = await createCertificationHelper({
      status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
      rncpId: "EXISTING-RNCP-4",
    });

    // Create authority structure with proper access
    const { certificationRegistryManager } =
      await createCertificationAuthorityStructureHelper({
        certifications: {
          connect: { id: existingCertification.id },
        },
      });

    // Mock RNCP referential to return null (certification not found)
    jest.spyOn(RNCPReferential, "getInstance").mockImplementation(
      () =>
        ({
          findOneByRncp: () => null,
        }) as unknown as RNCPReferential,
    );

    // Set up GraphQL client
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_certification_registry",
          keycloakId: certificationRegistryManager?.account.keycloakId,
        }),
      },
    });

    // Make the request with an RNCP code that doesn't exist
    const promise = graphqlClient.request(replaceCertificationMutation, {
      input: {
        codeRncp: "RNCP-TEST-5",
        certificationId: existingCertification.id,
      },
    });

    // Verify the expected error
    await expect(promise).rejects.toThrow(
      getGraphQLError(
        "La certification avec le code RNCP RNCP-TEST-5 n'existe pas dans le référentiel RNCP",
      ),
    );
  });

  it("should throw an error if a more recent version already exists", async () => {
    await createFormaCode();
    const existingCertification = await createCertificationHelper({
      status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
      rncpId: CURRENT_RNCP,
    });

    // Create a more recent version of the certification
    await createCertificationHelper({
      status: CertificationStatus.VALIDE_PAR_CERTIFICATEUR,
      rncpId: NEW_RNCP,
      previousVersionCertificationId: existingCertification.id,
    });

    // Create authority structure with proper access
    const { certificationRegistryManager } =
      await createCertificationAuthorityStructureHelper({
        certifications: {
          connect: { id: existingCertification.id },
        },
      });

    // Set up GraphQL client
    const graphqlClient = getGraphQLClient({
      headers: {
        authorization: authorizationHeaderForUser({
          role: "manage_certification_registry",
          keycloakId: certificationRegistryManager?.account.keycloakId,
        }),
      },
    });

    // Make the request that should fail
    const promise = graphqlClient.request(replaceCertificationMutation, {
      input: {
        codeRncp: NEW_RNCP,
        certificationId: existingCertification.id,
      },
    });

    // Verify the expected error
    await expect(promise).rejects.toThrow(
      getGraphQLError(
        "Une version plus récente de cette certification existe déjà",
      ),
    );
  });
});
