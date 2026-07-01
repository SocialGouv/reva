import { vi } from "vitest";

import * as FeasibilityFeatures from "@/modules/feasibility/feasibility.features";

import { isCandidacyCertificationAuthorityUpdatable } from "./isCandidacyCertificationAuthorityUpdatable";

const mockGetActiveFeasibility = (decision: string | null | undefined) => {
  vi.spyOn(
    FeasibilityFeatures,
    "getActiveFeasibilityByCandidacyid",
  ).mockResolvedValue(
    decision !== undefined ? ({ decision } as never) : undefined,
  );
};

const CANDIDACY_ID = "candidacy-id";

describe("isCandidacyCertificationAuthorityUpdatable", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns true when there is no active feasibility", async () => {
    vi.spyOn(
      FeasibilityFeatures,
      "getActiveFeasibilityByCandidacyid",
    ).mockResolvedValue(undefined);

    const result = await isCandidacyCertificationAuthorityUpdatable({
      candidacyId: CANDIDACY_ID,
    });

    expect(result).toBe(true);
  });

  test.each([
    [false, "PENDING"],
    [false, "REJECTED"],
    [false, "ADMISSIBLE"],
    [false, "COMPLETE"],
    [true, "DRAFT"],
    [true, "INCOMPLETE"],
    [true, null],
  ] as const)(
    "returns %s when feasibility decision is %s",
    async (expected: boolean, decision: string | null) => {
      mockGetActiveFeasibility(decision);

      const result = await isCandidacyCertificationAuthorityUpdatable({
        candidacyId: CANDIDACY_ID,
      });

      expect(result).toBe(expected);
    },
  );
});
