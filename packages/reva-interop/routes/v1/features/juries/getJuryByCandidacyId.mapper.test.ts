import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { buildJuryCandidacyFixture } from "../__testUtils/fixtures.js";

import { mapGetJuryByCandidacyId } from "./getJuryByCandidacyId.mapper.js";

describe("mapGetJuryByCandidacyId", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-17T12:00:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("maps a future jury session to PROGRAMME", () => {
    const mapped = mapGetJuryByCandidacyId(
      buildJuryCandidacyFixture({
        jury: { dateOfSession: new Date("2026-12-01") },
      }),
    );

    expect(mapped.data).toEqual({
      candidatureId: buildJuryCandidacyFixture().id,
      statut: "PROGRAMME",
    });
  });

  test("maps a past jury session to PASSE", () => {
    const mapped = mapGetJuryByCandidacyId(
      buildJuryCandidacyFixture({
        jury: { dateOfSession: new Date("2026-01-01") },
      }),
    );

    expect(mapped.data?.statut).toBe("PASSE");
  });

  test("returns undefined data when jury is missing", () => {
    const mapped = mapGetJuryByCandidacyId(
      buildJuryCandidacyFixture({ jury: null }),
    );

    expect(mapped.data).toBeUndefined();
  });
});
