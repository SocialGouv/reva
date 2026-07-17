import { describe, expect, test } from "vitest";

import { buildJurySessionCandidacyFixture } from "../__testUtils/fixtures.js";

import { mapScheduleJurySessionByCandidacyId } from "./scheduleJurySessionByCandidacyId.mapper.js";

describe("mapScheduleJurySessionByCandidacyId", () => {
  test("maps session date, address and information", () => {
    const mapped = mapScheduleJurySessionByCandidacyId(
      buildJurySessionCandidacyFixture(),
    );

    expect(mapped.data).toEqual({
      date: "2026-08-15",
      heure: "14:30",
      adresseSession: "10 avenue de la République",
      informationsSession: "Prévoir une pièce d'identité",
    });
  });

  test("omits heure when time is not specified", () => {
    const mapped = mapScheduleJurySessionByCandidacyId(
      buildJurySessionCandidacyFixture({
        jury: {
          ...buildJurySessionCandidacyFixture().jury!,
          timeSpecified: false,
        },
      }),
    );

    expect(mapped.data?.heure).toBeUndefined();
    expect(mapped.data?.date).toBe("2026-08-15");
  });

  test("returns undefined data when jury is missing", () => {
    const mapped = mapScheduleJurySessionByCandidacyId(
      buildJurySessionCandidacyFixture({ jury: null }),
    );

    expect(mapped.data).toBeUndefined();
  });
});
