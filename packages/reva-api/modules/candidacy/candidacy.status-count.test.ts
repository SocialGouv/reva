/**
 * @jest-environment ./test/fastify-test-env.ts
 */

import { CandidacyStatusStep } from "@prisma/client";
import { authorizationHeaderForUser } from "../../test/helpers/authorization-helper";
import { createCandidacyHelper } from "../../test/helpers/entities/create-candidacy-helper";
import { injectGraphql } from "../../test/helpers/graphql-helper";
import { clearDatabase } from "../../test/jestClearDatabaseBeforeEachTestFile";
import { CandidacyStatusFilter } from "./candidacy.types";

afterEach(async () => {
  await clearDatabase();
});

const createCandidacies = async (
  statusAndCounts: {
    status: CandidacyStatusStep;
    count: number;
  }[],
) => {
  for (const { status, count } of statusAndCounts) {
    for (let i = 0; i < count; i++) {
      await createCandidacyHelper({
        candidacyActiveStatus: status,
      });
    }
  }
};

const executeQueryAndAssertResults = async (
  defaultAssertionOverride?: Partial<Record<CandidacyStatusFilter, number>>,
) => {
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
      role: "admin",
      keycloakId: "whatever",
    }),
    payload: {
      requestType: "query",
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

describe("Simple candidacy status counters", () => {
  const testData: [
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
  test.each(testData)(
    "should count 5 candidacies with status %s and status filter %s as %s for admin",
    async (
      status: CandidacyStatusStep,
      statusFilter: CandidacyStatusFilter,
      activeOrInactive: "ACTIVE" | "INACTIVE",
    ) => {
      await createCandidacies([
        {
          status,
          count: 5,
        },
      ]);

      await executeQueryAndAssertResults({
        ACTIVE_HORS_ABANDON: activeOrInactive === "ACTIVE" ? 5 : 0,
        [statusFilter]: 5,
      });
    },
  );
});
