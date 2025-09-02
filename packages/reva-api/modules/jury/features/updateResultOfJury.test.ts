import { tz } from "@date-fns/tz";
import { startOfYesterday } from "date-fns";

import { graphql } from "@/modules/graphql/generated";
import { JuryResult } from "@/modules/graphql/generated/graphql";
import { prismaClient } from "@/prisma/client";
import { authorizationHeaderForUser } from "@/test/helpers/authorization-helper";
import { createCandidacyHelper } from "@/test/helpers/entities/create-candidacy-helper";
import { createCertificationAuthorityLocalAccountHelper } from "@/test/helpers/entities/create-certification-authority-local-account-helper";
import { createCertificationHelper } from "@/test/helpers/entities/create-certification-helper";
import { createFeasibilityUploadedPdfHelper } from "@/test/helpers/entities/create-feasibility-uploaded-pdf-helper";
import { createJuryHelper } from "@/test/helpers/entities/create-jury-helper";
import { getGraphQLClient } from "@/test/test-graphql-client";

import * as SendJuryResultAAPEmailModule from "../emails/sendJuryResultAAPEmail";
import * as SendJuryResultCandidateEmailModule from "../emails/sendJuryResultCandidateEmail";

const yesterday = startOfYesterday({ in: tz("UTC") });

const readyForJuryEstimatedAt = yesterday;
const adminAccount = { keycloakId: "3c6d4571-da18-49a3-90e5-cc83ae7446bf" };

async function createJuryAndDependenciesHelper() {
  const certificationAuthorityLocalAccount =
    await createCertificationAuthorityLocalAccountHelper();

  const certification = await createCertificationHelper({
    certificationAuthorityStructureId:
      certificationAuthorityLocalAccount.certificationAuthority
        .certificationAuthorityOnCertificationAuthorityStructure[0]
        ?.certificationAuthorityStructureId,
  });

  const candidacy = await createCandidacyHelper({
    candidacyActiveStatus: "DOSSIER_DE_VALIDATION_ENVOYE",
    candidacyArgs: {
      readyForJuryEstimatedAt,
      certificationId: certification.id,
    },
  });

  await createFeasibilityUploadedPdfHelper({
    certificationAuthorityId:
      certificationAuthorityLocalAccount.certificationAuthorityId,
    candidacyId: candidacy.id,
    decision: "ADMISSIBLE",
  });

  await prismaClient.certificationAuthorityLocalAccountOnCertification.create({
    data: {
      certificationAuthorityLocalAccountId:
        certificationAuthorityLocalAccount.id,
      certificationId: certification.id,
    },
  });

  await prismaClient.certificationAuthorityLocalAccountOnDepartment.create({
    data: {
      certificationAuthorityLocalAccountId:
        certificationAuthorityLocalAccount.id,
      departmentId: candidacy.candidate?.departmentId || "",
    },
  });

  const jury = await createJuryHelper({
    candidacyId: candidacy.id,
    dateOfSession: yesterday,
  });

  return {
    jury,
    certificationAuthorityLocalAccount,
  };
}

async function graphqlUpdateJuryResult({
  role,
  account,
  juryId,
  result,
}: {
  role: KeyCloakUserRole;
  account: { keycloakId: string };
  juryId: string;
  result: JuryResult;
}) {
  const graphqlClient = getGraphQLClient({
    headers: {
      authorization: authorizationHeaderForUser({
        role,
        keycloakId: account.keycloakId,
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
  "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
];

failedJuryResults.forEach((failedResult) => {
  test(`should reset ready jury estimated date when submitting failed jury result ${failedResult}`, async () => {
    const { jury, certificationAuthorityLocalAccount } =
      await createJuryAndDependenciesHelper();

    await graphqlUpdateJuryResult({
      role: "manage_feasibility",
      account: certificationAuthorityLocalAccount.account,
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
    const { jury, certificationAuthorityLocalAccount } =
      await createJuryAndDependenciesHelper();

    await graphqlUpdateJuryResult({
      role: "manage_feasibility",
      account: certificationAuthorityLocalAccount.account,
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
    expect(candidacyUpdated?.readyForJuryEstimatedAt).toEqual(
      readyForJuryEstimatedAt,
    );
  });
});

test("should save jury result without errors", async () => {
  const { jury, certificationAuthorityLocalAccount } =
    await createJuryAndDependenciesHelper();

  const res = await graphqlUpdateJuryResult({
    role: "manage_feasibility",
    account: certificationAuthorityLocalAccount.account,
    juryId: jury.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  const juryUpdated = await prismaClient.jury.findUnique({
    where: { id: jury.id },
  });

  expect(res).toMatchObject({ jury_updateResult: { id: jury.id } });
  expect(juryUpdated?.result).toEqual("FULL_SUCCESS_OF_FULL_CERTIFICATION");
  expect(juryUpdated?.isResultTemporary).toEqual(false);
});

test("should send jury result to candidate", async () => {
  const sendJuryResultCandidateEmailSpy = vi.spyOn(
    SendJuryResultCandidateEmailModule,
    "sendJuryResultCandidateEmail",
  );

  const { jury, certificationAuthorityLocalAccount } =
    await createJuryAndDependenciesHelper();

  await graphqlUpdateJuryResult({
    role: "manage_feasibility",
    account: certificationAuthorityLocalAccount.account,
    juryId: jury.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  expect(sendJuryResultCandidateEmailSpy).toHaveBeenCalledWith({
    email: jury.candidacy.candidate?.email,
  });
  expect(sendJuryResultCandidateEmailSpy).toHaveBeenCalledTimes(1);
});

test("should send jury result to organism", async () => {
  const sendJuryResultAAPEmailSpy = vi.spyOn(
    SendJuryResultAAPEmailModule,
    "sendJuryResultAAPEmail",
  );

  const { jury, certificationAuthorityLocalAccount } =
    await createJuryAndDependenciesHelper();

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
    role: "manage_feasibility",
    account: certificationAuthorityLocalAccount.account,
    juryId: jury.id,
    result: "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  });

  expect(sendJuryResultAAPEmailSpy).toHaveBeenCalledWith({
    candidacyId: jury.candidacy.id,
    email: organism?.contactAdministrativeEmail,
    candidateFullName: `${jury.candidacy.candidate?.firstname} ${jury.candidacy.candidate?.lastname}`,
  });
  expect(sendJuryResultAAPEmailSpy).toHaveBeenCalledTimes(1);
});

// Final result are all results except "PARTIAL_SUCCESS_PENDING_CONFIRMATION"
const finalJuryResults: JuryResult[] = [
  "FULL_SUCCESS_OF_FULL_CERTIFICATION",
  "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
  "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
  "FAILURE",
  "CANDIDATE_EXCUSED",
  "CANDIDATE_ABSENT",
];

finalJuryResults.forEach((result) => {
  test(`should allow an admin to send a ${result} result with pending confirmation`, async () => {
    const { jury } = await createJuryAndDependenciesHelper();

    const res = await graphqlUpdateJuryResult({
      role: "admin",
      account: adminAccount,
      juryId: jury.id,
      result: result,
    });

    const juryUpdated = await prismaClient.jury.findUnique({
      where: { id: jury.id },
    });

    expect(res).toMatchObject({ jury_updateResult: { id: jury.id } });
    expect(juryUpdated?.isResultTemporary).toEqual(true);
  });
});
