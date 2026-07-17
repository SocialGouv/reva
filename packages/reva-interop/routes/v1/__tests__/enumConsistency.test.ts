import { Client } from "@urql/core";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { JuryResult } from "../../../graphql/generated/graphql.js";
import {
  buildDossierDeValidationRowFixture,
  buildDossiersDeValidationPageFixture,
  buildFeasibilityCandidacyFixture,
  buildJuryResultCandidacyFixture,
  CANDIDACY_ID,
} from "../features/__testUtils/fixtures.js";
import { getDossiersDeValidation } from "../features/dossiersDeValidation/getDossiersDeValidation.js";
import { mapGetDossiersDeValidation } from "../features/dossiersDeValidation/getDossiersDeValidation.mapper.js";
import { createFeasibilityDecisionByCandidacyId } from "../features/feasibilities/createFeasibilityDecisionByCandidacyId.js";
import { mapCreateFeasibilityDecisionByCandidacyId } from "../features/feasibilities/createFeasibilityDecisionByCandidacyId.mapper.js";
import { getFeasibilities } from "../features/feasibilities/getFeasibilities.js";
import { mapGetFeasibilityByCandidacyId } from "../features/feasibilities/getFeasibilityByCandidacyId.mapper.js";
import { updateJuryResultByCandidacyId } from "../features/juries/updateJuryResultByCandidacyId.js";
import { mapUpdateJuryResultByCandidacyId } from "../features/juries/updateJuryResultByCandidacyId.mapper.js";
import { decisionDossierDeFaisabiliteSchemaInput } from "../inputSchemas.js";
import { resultatJurySchema } from "../schemas.js";

const JURY_RESULT_PAIRS = [
  ["FULL_SUCCESS_OF_FULL_CERTIFICATION", "SUCCES_TOTAL_CERTIFICATION_COMPLETE"],
  [
    "PARTIAL_SUCCESS_PENDING_CONFIRMATION",
    "SUCCES_TOTAL_CERTIFICATION_COMPLETE_SOUS_RESERVE",
  ],
  [
    "PARTIAL_SUCCESS_OF_FULL_CERTIFICATION",
    "SUCCES_PARTIEL_CERTIFICATION_COMPLETE",
  ],
  [
    "FULL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "SUCCES_TOTAL_CERTIFICATION_PARTIELLE",
  ],
  [
    "PARTIAL_SUCCESS_OF_PARTIAL_CERTIFICATION",
    "SUCCES_PARTIEL_CERTIFICATION_PARTIELLE",
  ],
  ["FAILURE", "ECHEC"],
  ["CANDIDATE_EXCUSED", "CANDIDAT_EXCUSE"],
  ["CANDIDATE_ABSENT", "CANDIDAT_ABSENT"],
] as const satisfies ReadonlyArray<
  [JuryResult, (typeof resultatJurySchema)["enum"][number]]
>;

const DOSSIER_VALIDATION_STATUS_PAIRS = [
  ["PENDING", "EN_ATTENTE"],
  ["INCOMPLETE", "SIGNALE"],
  ["COMPLETE", "VERIFIE"],
] as const;

const FEASIBILITY_STATUS_FILTER_PAIRS = [
  ["PENDING", "EN_ATTENTE"],
  ["REJECTED", "IRRECEVABLE"],
  ["ADMISSIBLE", "RECEVABLE"],
  ["DROPPED_OUT", "ABANDONNE"],
  ["INCOMPLETE", "INCOMPLET"],
  ["COMPLETE", "COMPLET"],
  ["ARCHIVED", "ARCHIVE"],
] as const;

const FEASIBILITY_DECISION_PAIRS = [
  ["REJECTED", "IRRECEVABLE"],
  ["ADMISSIBLE", "RECEVABLE"],
  ["INCOMPLETE", "INCOMPLET"],
  ["COMPLETE", "COMPLET"],
] as const;

const buildGraphqlClientMock = ({
  queryResults = [],
  mutationResult = { data: {} },
}: {
  queryResults?: unknown[];
  mutationResult?: unknown;
}) => {
  const query = vi
    .fn()
    .mockImplementation(async () => queryResults.shift() ?? { data: {} });
  const mutation = vi.fn().mockResolvedValue(mutationResult);

  return {
    client: { query, mutation } as unknown as Client,
    query,
    mutation,
  };
};

describe("enum consistency", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("jury results", () => {
    test.each(JURY_RESULT_PAIRS)(
      "maps GraphQL %s to REST %s in jury result mapper",
      (gqlValue, interopValue) => {
        const mapped = mapUpdateJuryResultByCandidacyId(
          buildJuryResultCandidacyFixture({
            jury: {
              ...buildJuryResultCandidacyFixture().jury!,
              result: gqlValue,
            },
          }),
        );

        expect(mapped.data?.resultat).toBe(interopValue);
      },
    );

    test.each(JURY_RESULT_PAIRS)(
      "maps REST %s to GraphQL %s when updating jury result",
      async (_gqlValue, interopValue) => {
        const jury = buildJuryResultCandidacyFixture().jury!;
        const { client, mutation, query } = buildGraphqlClientMock({
          queryResults: [
            { data: { getCandidacyById: { id: CANDIDACY_ID, jury } } },
            { data: { getCandidacyById: { id: CANDIDACY_ID, jury } } },
          ],
        });

        await updateJuryResultByCandidacyId(client, CANDIDACY_ID, {
          resultat: interopValue,
        });

        expect(mutation).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            juryId: jury.id,
            input: expect.objectContaining({
              result: _gqlValue,
            }),
          }),
        );
        expect(query).toHaveBeenCalledTimes(2);
      },
    );
  });

  describe("dossier de validation status", () => {
    test.each(DOSSIER_VALIDATION_STATUS_PAIRS)(
      "maps GraphQL %s to REST %s in dossier de validation mapper",
      (gqlValue, interopValue) => {
        const mapped = mapGetDossiersDeValidation(
          buildDossiersDeValidationPageFixture([
            buildDossierDeValidationRowFixture({ decision: gqlValue }),
          ]),
        );

        expect(mapped.data?.[0]?.statut).toBe(interopValue);
      },
    );

    test.each(DOSSIER_VALIDATION_STATUS_PAIRS)(
      "maps REST %s to GraphQL %s when listing dossiers de validation",
      async (gqlValue, interopValue) => {
        const { client, query } = buildGraphqlClientMock({
          queryResults: [
            {
              data: {
                dossierDeValidation_getDossiersDeValidation: {
                  rows: [],
                  info: { totalRows: 0, currentPage: 1, totalPages: 0 },
                },
              },
            },
          ],
        });

        await getDossiersDeValidation(client, 0, 10, interopValue);

        expect(query).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            categoryFilter: gqlValue,
          }),
        );
      },
    );
  });

  describe("feasibility status filter", () => {
    test.each(FEASIBILITY_STATUS_FILTER_PAIRS)(
      "maps GraphQL %s to REST %s from feasibility decision",
      (gqlValue, interopValue) => {
        const mapped = mapGetFeasibilityByCandidacyId(
          buildFeasibilityCandidacyFixture({
            feasibility: {
              ...buildFeasibilityCandidacyFixture().feasibility!,
              decision: gqlValue,
            },
          }),
        );

        expect(mapped.data?.statut).toBe(interopValue);
      },
    );

    test.each(FEASIBILITY_STATUS_FILTER_PAIRS)(
      "maps REST %s to GraphQL %s when listing feasibilities",
      async (gqlValue, interopValue) => {
        const { client, query } = buildGraphqlClientMock({
          queryResults: [
            {
              data: {
                feasibility_getFeasibilities: {
                  rows: [],
                  info: { totalRows: 0, currentPage: 1, totalPages: 0 },
                },
              },
            },
          ],
        });

        await getFeasibilities(client, 0, 10, interopValue);

        expect(query).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            categoryFilter: gqlValue,
          }),
        );
      },
    );

    test("maps GraphQL VAE_COLLECTIVE to REST VAE_COLLECTIVE without a list filter counterpart", () => {
      const mapped = mapGetFeasibilityByCandidacyId(
        buildFeasibilityCandidacyFixture({
          feasibility: {
            ...buildFeasibilityCandidacyFixture().feasibility!,
            decision: "VAE_COLLECTIVE",
          },
        }),
      );

      expect(mapped.data?.statut).toBe("VAE_COLLECTIVE");
    });

    test("does not map VAE_COLLECTIVE REST filter to GraphQL when listing feasibilities", async () => {
      const { client, query } = buildGraphqlClientMock({
        queryResults: [
          {
            data: {
              feasibility_getFeasibilities: {
                rows: [],
                info: { totalRows: 0, currentPage: 1, totalPages: 0 },
              },
            },
          },
        ],
      });

      await getFeasibilities(client, 0, 10, "VAE_COLLECTIVE");

      expect(query).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          categoryFilter: undefined,
        }),
      );
    });
  });

  describe("feasibility decisions", () => {
    test.each(FEASIBILITY_DECISION_PAIRS)(
      "maps GraphQL %s to REST %s in feasibility decision mapper",
      (gqlValue, interopValue) => {
        const mapped = mapCreateFeasibilityDecisionByCandidacyId({
          id: CANDIDACY_ID,
          feasibility: {
            id: "feasibility-1",
            feasibilityFormat: "DEMATERIALIZED",
            decision: gqlValue,
            decisionComment: "Décision",
            decisionSentAt: new Date("2025-01-01T00:00:00.000Z").getTime(),
            decisionFile: null,
          },
        });

        expect(mapped.data?.decision).toBe(interopValue);
      },
    );

    test.each(FEASIBILITY_DECISION_PAIRS)(
      "maps REST %s to GraphQL %s when creating a dematerialized feasibility decision",
      async (gqlValue, interopValue) => {
        const feasibility = {
          id: "feasibility-1",
          feasibilityFormat: "DEMATERIALIZED",
          decision: "PENDING",
          decisionComment: null,
          decisionSentAt: null,
          decisionFile: null,
        };
        const { client, mutation, query } = buildGraphqlClientMock({
          queryResults: [
            { data: { getCandidacyById: { id: CANDIDACY_ID, feasibility } } },
            { data: { getCandidacyById: { id: CANDIDACY_ID, feasibility } } },
          ],
        });

        await createFeasibilityDecisionByCandidacyId(
          client,
          "keycloak-jwt",
          CANDIDACY_ID,
          {
            decision:
              interopValue as (typeof decisionDossierDeFaisabiliteSchemaInput)["enum"][number],
          },
        );

        expect(mutation).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            candidacyId: CANDIDACY_ID,
            input: expect.objectContaining({
              decision: gqlValue,
            }),
          }),
        );
        expect(query).toHaveBeenCalledTimes(2);
      },
    );
  });
});
