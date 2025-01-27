import { clearDatabase } from "../../../test/jestClearDatabaseBeforeEachTestFile";
import { prismaClient } from "../../../prisma/client";
import { authorizationHeaderForUser } from "../../../test/helpers/authorization-helper";
import { createJuryHelper } from "../../../test/helpers/entities/create-jury-helper";
import { startOfYesterday } from "date-fns";
import { createCandidacyHelper } from "../../../test/helpers/entities/create-candidacy-helper";
import { createFeasibilityUploadedPdfHelper } from "../../../test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import * as SendJuryResultCandidateEmailModule from "../emails/sendJuryResultCandidateEmail";
import * as SendJuryResultAAPEmailModule from "../emails/sendJuryResultAAPEmail";
import { getGraphQLClient } from "../../../test/jestGraphqlClient";
import { graphql } from "../../graphql/generated";
import { JuryResult } from "../../graphql/generated/graphql";
import { FastifyInstance } from "fastify";
import { getFastifyInstance } from "../../../test/jestFastifyInstance";

const yesterday = startOfYesterday();

let app: FastifyInstance;

beforeAll(async () => {
  app = await getFastifyInstance();
});

afterAll(async () => {
  app.close();
});

afterEach(async () => {
  await clearDatabase();
  jest.clearAllMocks();
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

async function graphqlUpdateJuryResult({
  juryId,
  result,
}: {
  juryId: string;
  result: JuryResult;
}) {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role: "admin",
        keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf",
      }),
    },
  });

  const jury_updateResult = graphql(`
    mutation jury_updateResult($juryId: ID!, $input: JuryInfoInput!) {
      jury_updateResult(juryId: $juryId, input: $input) {
        id
      }
    }
  `);

  return graphqlClient.request(jury_updateResult, {
    juryId,
    input: {
      result,
    },
  });
}

const failedJuryResults: JuryResult[] = [
  "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
  "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
];

failedJuryResults.forEach((failedResult) => {
  test(`should reset ready jury estimated date when submitting failed jury result ${failedResult}`, async () => {
    const jury = await createJuryAndDependenciesHelper();

    await graphqlUpdateJuryResult({
      juryId: jury.id,
      result: failedResult,
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

const successfulJuryResults: JuryResult[] = [
  "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
];

successfulJuryResults.forEach((successfulResult) => {
  test(`should keep ready jury estimated date when submitting full jury result ${successfulResult}`, async () => {
    const jury = await createJuryAndDependenciesHelper();

    await graphqlUpdateJuryResult({
      juryId: jury.id,
      result: successfulResult,
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

test("should save jury result without errors", async () => {
  const jury = await createJuryAndDependenciesHelper();

  const res = await graphqlUpdateJuryResult({
    juryId: jury.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  const juryUpdated = await prismaClient.jury.findUnique({
    where: { id: jury.id },
  });

  expect(res).toMatchObject({ jury_updateResult: { id: jury.id } });
  expect(juryUpdated?.result).toEqual("FULL_SUCCESS_OF_FULL_CERTIFICATION");
});

test("should send jury result to candidate", async () => {
  const sendJuryResultCandidateEmailSpy = jest.spyOn(
    SendJuryResultCandidateEmailModule,
    "sendJuryResultCandidateEmail",
  );

  const jury = await createJuryAndDependenciesHelper();

  await graphqlUpdateJuryResult({
    juryId: jury.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  expect(sendJuryResultCandidateEmailSpy).toHaveBeenCalledWith({
    email: jury.candidacy.candidate?.email,
  });
  expect(await sendJuryResultCandidateEmailSpy.mock.results[0].value).toBe(
    `email sent to ${jury.candidacy.candidate?.email}`,
  );
});

test("should send jury result to organism", async () => {
  const sendJuryResultAAPEmailSpy = jest.spyOn(
    SendJuryResultAAPEmailModule,
    "sendJuryResultAAPEmail",
  );

  const jury = await createJuryAndDependenciesHelper();

  if (!jury.candidacy.organismId) {
    throw new Error("OrganismId is not defined");
  }

  const organism = await prismaClient.organism.findUnique({
    where: { id: jury.candidacy.organismId },
  });

  if (!organism) {
    throw new Error("No organism found");
  }

  await graphqlUpdateJuryResult({
    juryId: jury.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  expect(sendJuryResultAAPEmailSpy).toHaveBeenCalledWith({
    candidacyId: jury.candidacy.id,
    email: organism?.contactAdministrativeEmail,
    candidateFullName: `${jury.candidacy.candidate?.firstname} ${jury.candidacy.candidate?.lastname}`,
  });
  expect(await sendJuryResultAAPEmailSpy.mock.results[0].value).toBe(
    `email sent to ${organism.contactAdministrativeEmail}`,
  );
});
