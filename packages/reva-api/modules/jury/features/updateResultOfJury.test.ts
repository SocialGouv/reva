/**
 * @jest-environment ./test/fastify-test-env.ts
 */
import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";
import { prismaClient } from "../../../prisma/client";
import { injectGraphql } from "../../../test/helpers/graphql-helper";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createJuryHelper } from "../../../test/helpers/entities/create-jury-helper";
import { startOfYesterday } from "date-fns";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createFeasibilityUploadedPdfHelper } from "../../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";

const yesterday = startOfYesterday();

afterEach(async () => {
  await clearDatabase();
});

const readyForJuryEstimatedAt = yesterday;

async function createJuryAndDependenciesHelper() {
  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "DOSSIER_DE_VALIDATION_ENVOYE",
    candidacyArgs: { readyForJuryEstimatedAt },
  });

  await createFeasibilityUploadedPdfHelper({
    candidacyId: candidacy.id,
    decision: "ADMISSIBLE",
  });

  return await createJuryHelper({
    candidacyId: candidacy.id,
    dateOfSession: yesterday,
  });
}

const failedJuryResults = [
  "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
  "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
];

failedJuryResults.forEach((failedResult) => {
  test(`should reset ready jury estimated date when submitting failed jury result ${failedResult}`, async () => {
    const jury = await createJuryAndDependenciesHelper();

    await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
      }),
      payload: {
        requestType: "mutation",
        endpoint: "jury_updateResult",
        arguments: {
          juryId: jury.id,
          input: {
            result: failedResult,
          },
        },
        enumFields: ["result"],
        returnFields: "{id}",
      },
    });

    const candidacyUpdated = await prismaClient.candidacy.findUnique({
      where: { id: jury.candidacyId },
    });

    const juryUpdated = await prismaClient.jury.findUnique({
      where: { id: jury.id },
    });

    expect(juryUpdated?.result).toEqual(failedResult);
    expect(candidacyUpdated?.readyForJuryEstimatedAt).toBeNull();
  });
});

const successfulJuryResults = [
  "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
];

successfulJuryResults.forEach((successfulResult) => {
  test("should keep ready jury estimated date when submitting full jury result", async () => {
    const jury = await createJuryAndDependenciesHelper();

    await injectGraphql({
      fastify: (global as any).fastify,
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
      }),
      payload: {
        requestType: "mutation",
        endpoint: "jury_updateResult",
        arguments: {
          juryId: jury.id,
          input: {
            result: successfulResult,
          },
        },
        enumFields: ["result"],
        returnFields: "{id}",
      },
    });

    const candidacyUpdated = await prismaClient.candidacy.findUnique({
      where: { id: jury.candidacyId },
    });

    const juryUpdated = await prismaClient.jury.findUnique({
      where: { id: jury.id },
    });

    expect(juryUpdated?.result).toEqual(successfulResult);
    expect(candidacyUpdated?.readyForJuryEstimatedAt).toStrictEqual(
      readyForJuryEstimatedAt,
    );
  });
});
