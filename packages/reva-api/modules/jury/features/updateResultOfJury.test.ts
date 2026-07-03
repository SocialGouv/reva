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

  await createFeasibilityUploadedPdfHelper({
    certificationAuthorityId:
      certificationAuthorityLocalAccount.certificationAuthorityId,
    candidacyId: candidacy.id,
    decision: "ADMISSIBLE",
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
  juryResultByCompetenceBlocs,
}: {
  role: KeyCloakUserRole;
  account: { keycloakId: string };
  juryId: string;
  result: JuryResult;
  juryResultByCompetenceBlocs?: {
    competenceBlocId: string;
    isCompetenceBlocValidated: boolean;
  }[];
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
      juryResultByCompetenceBlocs,
    },
  });
}

async function setupJuryResultByBlockContext(
  candidacyId: string,
  certificationId: string,
) {
  const [bloc1, bloc2] = await Promise.all([
    prismaClient.certificationCompetenceBloc.create({
      data: {
        certificationId,
        label: "Bloc 1",
      },
    }),
    prismaClient.certificationCompetenceBloc.create({
      data: {
        certificationId,
        label: "Bloc 2",
      },
    }),
  ]);

  const feasibility = await prismaClient.feasibility.findFirstOrThrow({
    where: { candidacyId, isActive: true },
    select: { id: true },
  });

  await prismaClient.dematerializedFeasibilityFile.create({
    data: {
      feasibilityId: feasibility.id,
      dffCertificationCompetenceBlocs: {
        createMany: {
          data: [
            { certificationCompetenceBlocId: bloc1.id },
            { certificationCompetenceBlocId: bloc2.id },
          ],
        },
      },
    },
  });

  return [bloc1, bloc2];
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
  test(`devrait réinitialiser la date de jury estimée lors de la soumission d'un résultat de jury en échec ${failedResult}`, async () => {
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
  test(`devrait conserver la date de jury estimée lors de la soumission d'un résultat de jury en réussite totale ${successfulResult}`, async () => {
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

test("devrait enregistrer le résultat de jury sans erreur", async () => {
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

test("devrait enregistrer le résultat de jury par bloc de compétences", async () => {
  const { jury, certificationAuthorityLocalAccount } =
    await createJuryAndDependenciesHelper();
  if (!jury.candidacy.certificationId) {
    throw new Error("Certification id is not defined");
  }

  const [bloc1, bloc2] = await setupJuryResultByBlockContext(
    jury.candidacyId,
    jury.candidacy.certificationId,
  );

  await graphqlUpdateJuryResult({
    role: "manage_feasibility",
    account: certificationAuthorityLocalAccount.account,
    juryId: jury.id,
    result: "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    juryResultByCompetenceBlocs: [
      { competenceBlocId: bloc1.id, isCompetenceBlocValidated: true },
      { competenceBlocId: bloc2.id, isCompetenceBlocValidated: false },
    ],
  });

  const resultByBloc = await prismaClient.juryResultByCompetenceBloc.findMany({
    where: { juryId: jury.id },
  });

  expect(resultByBloc).toHaveLength(2);
  expect(resultByBloc).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        competenceBlocId: bloc1.id,
        isCompetenceBlocValidated: true,
      }),
      expect.objectContaining({
        competenceBlocId: bloc2.id,
        isCompetenceBlocValidated: false,
      }),
    ]),
  );
});

test("devrait rejeter un résultat par bloc lorsqu'un bloc de compétences ne fait pas partie du dossier de la candidature", async () => {
  const { jury, certificationAuthorityLocalAccount } =
    await createJuryAndDependenciesHelper();
  if (!jury.candidacy.certificationId) {
    throw new Error("Certification id is not defined");
  }

  const [bloc1] = await setupJuryResultByBlockContext(
    jury.candidacyId,
    jury.candidacy.certificationId,
  );

  const blocOutsideDossier =
    await prismaClient.certificationCompetenceBloc.create({
      data: {
        certificationId: jury.candidacy.certificationId,
        label: "Bloc hors dossier",
      },
    });

  await expect(
    graphqlUpdateJuryResult({
      role: "manage_feasibility",
      account: certificationAuthorityLocalAccount.account,
      juryId: jury.id,
      result: "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
      juryResultByCompetenceBlocs: [
        { competenceBlocId: bloc1.id, isCompetenceBlocValidated: true },
        {
          competenceBlocId: blocOutsideDossier.id,
          isCompetenceBlocValidated: false,
        },
      ],
    }),
  ).rejects.toThrow(
    "Un ou plusieurs blocs de compétences ne font pas partie du dossier de cette candidature",
  );
});

test("devrait rejeter un résultat de réussite par bloc lorsqu'aucun bloc n'est validé", async () => {
  const { jury, certificationAuthorityLocalAccount } =
    await createJuryAndDependenciesHelper();
  if (!jury.candidacy.certificationId) {
    throw new Error("Certification id is not defined");
  }

  const [bloc1, bloc2] = await setupJuryResultByBlockContext(
    jury.candidacyId,
    jury.candidacy.certificationId,
  );

  await expect(
    graphqlUpdateJuryResult({
      role: "manage_feasibility",
      account: certificationAuthorityLocalAccount.account,
      juryId: jury.id,
      result: "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
      juryResultByCompetenceBlocs: [
        { competenceBlocId: bloc1.id, isCompetenceBlocValidated: false },
        { competenceBlocId: bloc2.id, isCompetenceBlocValidated: false },
      ],
    }),
  ).rejects.toThrow("Vous devez valider au moins un bloc pour ce résultat");
});

test("devrait rejeter un résultat de réussite partielle lorsque tous les blocs sont validés", async () => {
  const { jury, certificationAuthorityLocalAccount } =
    await createJuryAndDependenciesHelper();
  if (!jury.candidacy.certificationId) {
    throw new Error("Certification id is not defined");
  }

  const [bloc1, bloc2] = await setupJuryResultByBlockContext(
    jury.candidacyId,
    jury.candidacy.certificationId,
  );

  await expect(
    graphqlUpdateJuryResult({
      role: "manage_feasibility",
      account: certificationAuthorityLocalAccount.account,
      juryId: jury.id,
      result: "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
      juryResultByCompetenceBlocs: [
        { competenceBlocId: bloc1.id, isCompetenceBlocValidated: true },
        { competenceBlocId: bloc2.id, isCompetenceBlocValidated: true },
      ],
    }),
  ).rejects.toThrow(
    "Vous ne pouvez pas valider tous les blocs pour ce résultat",
  );
});

test("devrait envoyer le résultat de jury au candidat", async () => {
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

test("devrait envoyer le résultat de jury à l'organisme", async () => {
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
  test(`devrait autoriser un administrateur à envoyer un résultat ${result} en attente de confirmation`, async () => {
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
