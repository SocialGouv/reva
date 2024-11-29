/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { CandidacyStatusStep, Candidate, Certification } from "@prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";
import { CandidacyStatusFilter } from "./candidacy.types";
import { createCandidacyDropOutHelper } from "../../test/helpers/entities/create-candidacy-drop-out-helper";
import { prismaClient } from "../../prisma/client";
import { createJuryHelper } from "../../test/helpers/entities/create-jury-helper";

afterEach(async () => {
  await clearDatabase();
});

const createCandidacies = async ({
  status,
  count,
  droppedOut,
  reoriented,
  jury,
}: {
  status: CandidacyStatusStep;
  count: number;
  droppedOut?: boolean;
  reoriented?: boolean;
  jury?: "WITH_RESULT_DATE" | "WITHOUT_RESULT_DATE";
}) => {
  const candidacies = [];
  let reorientation = null;
  if (reoriented) {
    reorientation = await prismaClient.reorientationReason.findFirst();
  }
  for (let i = 0; i < count; i++) {
    const candidacy = await createCandidacyHelper({
      candidacyActiveStatus: status,
      candidacyArgs: {
        reorientationReasonId: reoriented ? reorientation?.id : undefined,
      },
    });
    if (droppedOut) {
      await createCandidacyDropOutHelper({ candidacyId: candidacy.id });
    }
    if (jury) {
      await createJuryHelper({
        candidacyId: candidacy.id,
        dateOfResult: jury === "WITH_RESULT_DATE" ? new Date() : null,
      });
    }
    candidacies.push(candidacy);
  }
  return candidacies;
};

const executeQueryAndAssertResults = async ({
  keycloakId,
  role,
  searchFilter,
  defaultAssertionOverride,
}: {
  keycloakId?: string;
  role: KeyCloakUserRole;
  searchFilter?: string;
  defaultAssertionOverride?: Partial<Record<CandidacyStatusFilter, number>>;
}) => {
  const resultAssertion = {
    ACTIVE_HORS_ABANDON: 0,
    ABANDON: 0,
    REORIENTEE: 0,
    ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 0,
    PARCOURS_CONFIRME_HORS_ABANDON: 0,
    PRISE_EN_CHARGE_HORS_ABANDON: 0,
    PARCOURS_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON: 0,
    DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON: 0,
    DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 0,
    DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON: 0,
    JURY_HORS_ABANDON: 0,
    JURY_PROGRAMME_HORS_ABANDON: 0,
    JURY_PASSE_HORS_ABANDON: 0,
    DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON: 0,
    DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON: 0,
    VALIDATION_HORS_ABANDON: 0,
    PROJET_HORS_ABANDON: 0,
    ...defaultAssertionOverride,
  };

  const resp = await injectGraphql({
    fastify: (global as any).fastify,
    authorization: authorizationHeaderForUser({
      role,
      keycloakId: keycloakId || "whatever",
    }),
    payload: {
      requestType: "query",
      arguments: searchFilter ? { searchFilter } : undefined,
      endpoint: "candidacy_candidacyCountByStatus",
      returnFields:
        "{ACTIVE_HORS_ABANDON, ABANDON, REORIENTEE, ARCHIVE_HORS_ABANDON_HORS_REORIENTATION, PARCOURS_CONFIRME_HORS_ABANDON, PRISE_EN_CHARGE_HORS_ABANDON, PARCOURS_ENVOYE_HORS_ABANDON, DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON, DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON, DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON, DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON, DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON, DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON, JURY_HORS_ABANDON, JURY_PROGRAMME_HORS_ABANDON, JURY_PASSE_HORS_ABANDON, DEMANDE_FINANCEMENT_ENVOYE_HORS_ABANDON, DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON, VALIDATION_HORS_ABANDON, PROJET_HORS_ABANDON}",
    },
  });
  expect(resp.statusCode).toEqual(200);
  const obj = resp.json();
  expect(obj.data.candidacy_candidacyCountByStatus).toMatchObject(
    resultAssertion,
  );
};

const simpleStatusesTestData: [
  CandidacyStatusStep,
  CandidacyStatusFilter,
  "ACTIVE" | "INACTIVE",
][] = [
  [CandidacyStatusStep.PROJET, "PROJET_HORS_ABANDON", "INACTIVE"],
  [CandidacyStatusStep.VALIDATION, "VALIDATION_HORS_ABANDON", "ACTIVE"],
  [
    CandidacyStatusStep.PRISE_EN_CHARGE,
    "PRISE_EN_CHARGE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.PARCOURS_ENVOYE,
    "PARCOURS_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.PARCOURS_CONFIRME,
    "PARCOURS_CONFIRME_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_ENVOYE,
    "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_INCOMPLET,
    "DOSSIER_FAISABILITE_INCOMPLET_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_COMPLET,
    "DOSSIER_FAISABILITE_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_RECEVABLE,
    "DOSSIER_FAISABILITE_RECEVABLE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_FAISABILITE_NON_RECEVABLE,
    "DOSSIER_FAISABILITE_NON_RECEVABLE_HORS_ABANDON",
    "INACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
    "DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DOSSIER_DE_VALIDATION_SIGNALE,
    "DOSSIER_DE_VALIDATION_SIGNALE_HORS_ABANDON",
    "ACTIVE",
  ],
  [
    CandidacyStatusStep.DEMANDE_PAIEMENT_ENVOYEE,
    "DEMANDE_PAIEMENT_ENVOYEE_HORS_ABANDON",
    "ACTIVE",
  ],
];

describe("Candidacy status count tests for admin", () => {
  test.each(simpleStatusesTestData)(
    "should count 5 candidacies with status %s and status filter %s as %s",
    async (
      status: CandidacyStatusStep,
      statusFilter: CandidacyStatusFilter,
      activeOrInactive: "ACTIVE" | "INACTIVE",
    ) => {
      await createCandidacies({
        status,
        count: 5,
      });

      await executeQueryAndAssertResults({
        role: "admin",
        defaultAssertionOverride: {
          ACTIVE_HORS_ABANDON: activeOrInactive === "ACTIVE" ? 5 : 0,
          [statusFilter]: 5,
        },
      });
    },
  );

  test("should count 5 dropped out candidacies", async () => {
    await createCandidacies({
      status: CandidacyStatusStep.PRISE_EN_CHARGE,
      count: 5,
      droppedOut: true,
    });

    await executeQueryAndAssertResults({
      role: "admin",
      defaultAssertionOverride: { ABANDON: 5 },
    });
  });

  test("should count 5 archived candidacies", async () => {
    await createCandidacies({
      status: CandidacyStatusStep.ARCHIVE,
      count: 5,
    });

    await executeQueryAndAssertResults({
      role: "admin",
      defaultAssertionOverride: { ARCHIVE_HORS_ABANDON_HORS_REORIENTATION: 5 },
    });
  });

  test("should count 5 reoriented candidacies", async () => {
    await createCandidacies({
      status: CandidacyStatusStep.ARCHIVE,
      count: 5,
      reoriented: true,
    });

    await executeQueryAndAssertResults({
      role: "admin",
      defaultAssertionOverride: { REORIENTEE: 5 },
    });
  });

  test("should count 5 'JURY_PROGRAMME_HORS_ABANDON' candidacies", async () => {
    await createCandidacies({
      status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      jury: "WITHOUT_RESULT_DATE",
      count: 5,
    });

    await executeQueryAndAssertResults({
      role: "admin",
      defaultAssertionOverride: {
        ACTIVE_HORS_ABANDON: 5,
        DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 5,
        JURY_HORS_ABANDON: 5,
        JURY_PROGRAMME_HORS_ABANDON: 5,
      },
    });
  });

  test("should count 5 'JURY_PASSE_HORS_ABANDON' candidacies", async () => {
    await createCandidacies({
      status: CandidacyStatusStep.DOSSIER_DE_VALIDATION_ENVOYE,
      jury: "WITH_RESULT_DATE",
      count: 5,
    });

    await executeQueryAndAssertResults({
      role: "admin",
      defaultAssertionOverride: {
        ACTIVE_HORS_ABANDON: 5,
        DOSSIER_DE_VALIDATION_ENVOYE_HORS_ABANDON: 5,
        JURY_HORS_ABANDON: 5,
        JURY_PASSE_HORS_ABANDON: 5,
      },
    });
  });

  test("should count 0 candidacy when searching for the wrong search criteria", async () => {
    await createCandidacyHelper();

    await executeQueryAndAssertResults({
      role: "admin",
      searchFilter: "WRONG_CRITERIA",
    });
  });

  test("should count 1 candidacy when searching for the right organism label", async () => {
    const { organism } = await createCandidacyHelper();

    await executeQueryAndAssertResults({
      role: "admin",
      searchFilter: organism?.label,
      defaultAssertionOverride: {
        ACTIVE_HORS_ABANDON: 1,
        PARCOURS_CONFIRME_HORS_ABANDON: 1,
      },
    });
  });

  test("should count 1 candidacy when searching for the right department label", async () => {
    const { department } = await createCandidacyHelper();

    await executeQueryAndAssertResults({
      role: "admin",
      searchFilter: department?.label,
      defaultAssertionOverride: {
        ACTIVE_HORS_ABANDON: 1,
        PARCOURS_CONFIRME_HORS_ABANDON: 1,
      },
    });
  });

  test.each(["label", "rncpTypeDiplome"] as const)(
    "should count 1 candidacy when searching for the right candidate %s",
    async (field: keyof Certification) => {
      const { certification } = await createCandidacyHelper();

      await executeQueryAndAssertResults({
        role: "admin",
        searchFilter: certification?.[field] as string,
        defaultAssertionOverride: {
          ACTIVE_HORS_ABANDON: 1,
          PARCOURS_CONFIRME_HORS_ABANDON: 1,
        },
      });
    },
  );

  test.each([
    "lastname",
    "firstname",
    "firstname2",
    "firstname3",
    "email",
    "phone",
  ] as const)(
    "should count 1 candidacy when searching for the right candidate %s",
    async (field: keyof Candidate) => {
      const { candidate } = await createCandidacyHelper();

      await executeQueryAndAssertResults({
        role: "admin",
        searchFilter: candidate?.[field] as string,
        defaultAssertionOverride: {
          ACTIVE_HORS_ABANDON: 1,
          PARCOURS_CONFIRME_HORS_ABANDON: 1,
        },
      });
    },
  );
});
