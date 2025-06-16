import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createCertificationHelper } from "../../../test/helpers/entities/create-certification-helper";
import { createJuryHelper } from "../../../test/helpers/entities/create-jury-helper";
import { createOrganismHelper } from "../../../test/helpers/entities/create-organism-helper";
import { createFeasibilityUploadedPdfHelper } from "../../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { createCertificationAuthorityHelper } from "../../../test/helpers/entities/create-certification-authority-helper";
import { createCertificationAuthorityLocalAccountHelper } from "../../../test/helpers/entities/create-certification-authority-local-account-helper";
import {
  getGraphQLClient,
  getGraphQLError,
} from "../../../test/jestGraphqlClient";
import { shouldNotGoHere } from "../../../test/jestHelpers";
import { graphql } from "../../graphql/generated";

async function setupTestCandidacyWithFeasibility() {
  const organism = await createOrganismHelper();
  const certificationAuthority = await createCertificationAuthorityHelper();
  const certification = await createCertificationHelper({
    certificationAuthorityStructureId:
      certificationAuthority
        .certificationAuthorityOnCertificationAuthorityStructure[0]
        ?.certificationAuthorityStructureId,
  });
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "DOSSIER_DE_VALIDATION_ENVOYE",
    candidacyArgs: {
      organismId: organism.id,
      certificationId: certification.id,
    },
  });

  await createFeasibilityUploadedPdfHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    decision: "ADMISSIBLE",
    isActive: true,
  });

  return {
    organism,
    certificationAuthority,
    certification,
    candidacy,
  };
}

test("should revoke a jury decision successfully with reason", async () => {
  const { candidacy, certificationAuthority } =
    await setupTestCandidacyWithFeasibility();

  const jury = await createJuryHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    dateOfResult: new Date(),
    informationOfResult: "première décision",
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "00000000-0000-0000-0000-000000000001",
      }),
    },
  });

  const revokeJuryDecisionMutation = graphql(`
    mutation revokeJuryDecisionWithReason($juryId: ID!, $reason: String) {
      jury_revokeDecision(juryId: $juryId, reason: $reason) {
        id
        result
        dateOfResult
        informationOfResult
      }
    }
  `);

  const result = await graphqlClient.request(revokeJuryDecisionMutation, {
    juryId: jury.id,
    reason: "erreur de saisie",
  });

  expect(result.jury_revokeDecision).toMatchObject({
    result: null,
    dateOfResult: null,
    informationOfResult: null,
  });
  expect(result.jury_revokeDecision.id).not.toEqual(jury.id);

  const newActiveJury = await prismaClient.jury.findUnique({
    where: { id: result.jury_revokeDecision.id },
  });
  expect(newActiveJury).toMatchObject({
    isActive: true,
    candidacyId: candidacy.id,
    certificationAuthorityId: jury.certificationAuthorityId,
    result: null,
    dateOfResult: null,
    informationOfResult: null,
  });

  const logEntry = await prismaClient.candidacyLog.findFirst({
    where: {
      candidacyId: candidacy.id,
      eventType: "JURY_DECISION_REVOKED",
    },
  });

  expect(logEntry?.details).toEqual({
    reason: "erreur de saisie",
  });
});

test("should throw error when jury does not exist", async () => {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "00000000-0000-0000-0000-000000000001",
      }),
    },
  });

  const revokeJuryDecisionMutation = graphql(`
    mutation revokeJuryDecisionNonExistent($juryId: ID!, $reason: String) {
      jury_revokeDecision(juryId: $juryId, reason: $reason) {
        id
      }
    }
  `);

  try {
    await graphqlClient.request(revokeJuryDecisionMutation, {
      juryId: "00000000-0000-0000-0000-000000000000",
    });
    shouldNotGoHere();
  } catch (error) {
    const gqlError = getGraphQLError(error);
    expect(gqlError).toContain("Ces informations de jury n'existent pas");
  }
});

test("should throw error when jury has no result", async () => {
  const { candidacy, certificationAuthority } =
    await setupTestCandidacyWithFeasibility();

  const jury = await createJuryHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    result: null,
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "00000000-0000-0000-0000-000000000001",
      }),
    },
  });

  const revokeJuryDecisionMutation = graphql(`
    mutation revokeJuryDecisionNoResult($juryId: ID!, $reason: String) {
      jury_revokeDecision(juryId: $juryId, reason: $reason) {
        id
      }
    }
  `);

  try {
    await graphqlClient.request(revokeJuryDecisionMutation, {
      juryId: jury.id,
    });
    shouldNotGoHere();
  } catch (error) {
    const gqlError = getGraphQLError(error);
    expect(gqlError).toContain("Aucune décision n'a été prise pour ce jury");
  }
});

test("should throw error when user is not authorized", async () => {
  const { candidacy, certificationAuthority } =
    await setupTestCandidacyWithFeasibility();

  const jury = await createJuryHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_candidacy",
        keycloakId: "00000000-0000-0000-0000-000000000002",
      }),
    },
  });

  const revokeJuryDecisionMutation = graphql(`
    mutation revokeJuryDecisionUnauthorized($juryId: ID!, $reason: String) {
      jury_revokeDecision(juryId: $juryId, reason: $reason) {
        id
      }
    }
  `);

  try {
    await graphqlClient.request(revokeJuryDecisionMutation, {
      juryId: jury.id,
    });
    shouldNotGoHere();
  } catch (error) {
    const gqlError = getGraphQLError(error);
    expect(gqlError).toEqual("You are not authorized!");
  }
});

test("certificateur can submit a jury result but cannot revoke his decision himself", async () => {
  const { candidacy, certification, certificationAuthority } =
    await setupTestCandidacyWithFeasibility();

  const jury = await createJuryHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    result: null,
  });

  const candidate = await prismaClient.candidate.findUnique({
    where: { id: candidacy.candidateId! },
  });

  const certificationAuthorityLocalAccount =
    await createCertificationAuthorityLocalAccountHelper({
      certificationAuthorityId: certificationAuthority.id,
      certificationAuthorityLocalAccountOnCertification: {
        create: {
          certificationId: certification.id,
        },
      },
      certificationAuthorityLocalAccountOnDepartment: {
        create: {
          departmentId: candidate!.departmentId,
        },
      },
    });

  const updateResultMutation = graphql(`
    mutation updateJuryResult($juryId: ID!, $input: JuryInfoInput!) {
      jury_updateResult(juryId: $juryId, input: $input) {
        id
        result
      }
    }
  `);

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "manage_feasibility",
        keycloakId: certificationAuthorityLocalAccount.account.keycloakId,
      }),
    },
  });

  const updateResult = await graphqlClient.request(updateResultMutation, {
    juryId: jury.id,
    input: {
      result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
      informationOfResult: "première décision",
    },
  });

  expect(updateResult.jury_updateResult).toMatchObject({
    id: jury.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  const revokeJuryDecisionMutation = graphql(`
    mutation revokeJuryDecisionCertificateur($juryId: ID!, $reason: String) {
      jury_revokeDecision(juryId: $juryId, reason: $reason) {
        id
      }
    }
  `);

  try {
    await graphqlClient.request(revokeJuryDecisionMutation, {
      juryId: jury.id,
      reason: "Trying to revoke as certificateur",
    });
    shouldNotGoHere();
  } catch (error) {
    const gqlError = getGraphQLError(error);
    expect(gqlError).toEqual("You are not authorized!");
  }
});

test("should preserve jury history when revoking decision", async () => {
  const { candidacy, certificationAuthority } =
    await setupTestCandidacyWithFeasibility();

  const originalDateOfSession = new Date("2025-01-15");
  const originalDateOfResult = new Date("2025-02-15");
  const jury = await createJuryHelper({
    candidacyId: candidacy.id,
    certificationAuthorityId: certificationAuthority.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    dateOfResult: originalDateOfResult,
    dateOfSession: originalDateOfSession,
    informationOfResult: "première décision",
  });

  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "00000000-0000-0000-0000-000000000001",
      }),
    },
  });

  const revokeJuryDecisionMutation = graphql(`
    mutation revokeJuryDecisionHistory($juryId: ID!, $reason: String) {
      jury_revokeDecision(juryId: $juryId, reason: $reason) {
        id
      }
    }
  `);

  const result = await graphqlClient.request(revokeJuryDecisionMutation, {
    juryId: jury.id,
    reason: "erreur de saisie",
  });

  const archivedJury = await prismaClient.jury.findUnique({
    where: { id: jury.id },
  });
  expect(archivedJury).toMatchObject({
    id: jury.id,
    isActive: false,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
    informationOfResult: "première décision",
    dateOfSession: originalDateOfSession,
    dateOfResult: originalDateOfResult,
  });

  const allArchivedJuries = await prismaClient.jury.findMany({
    where: { candidacyId: candidacy.id, isActive: false },
  });
  expect(allArchivedJuries).toHaveLength(1);

  const newJury = await prismaClient.jury.findUnique({
    where: { id: result.jury_revokeDecision.id },
  });
  expect(newJury?.dateOfSession).toEqual(originalDateOfSession);
});
