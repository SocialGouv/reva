import { describe, expect, test } from "vitest";

import { buildJuryResultCandidacyFixture } from "../__testUtils/fixtures.js";

import { mapUpdateJuryResultByCandidacyId } from "./updateJuryResultByCandidacyId.mapper.js";

describe("mapUpdateJuryResultByCandidacyId", () => {
  test("maps result metadata and competence blocs", () => {
    const dateOfResult = new Date("2026-06-01T10:00:00.000Z").getTime();

    const mapped = mapUpdateJuryResultByCandidacyId(
      buildJuryResultCandidacyFixture({
        jury: {
          ...buildJuryResultCandidacyFixture().jury!,
          result: "FAILURE",
          dateOfResult,
          informationOfResult: null,
        },
      }),
    );

    expect(mapped.data).toEqual({
      resultat: "ECHEC",
      dateEnvoi: new Date(dateOfResult).toISOString(),
      commentaire: "",
      blocs: [
        {
          competenceBlocId: "bloc-1",
          code: "BC1",
          libelle: "Bloc 1",
          estValide: true,
        },
      ],
    });
  });

  test("returns undefined data when jury is missing", () => {
    const mapped = mapUpdateJuryResultByCandidacyId(
      buildJuryResultCandidacyFixture({ jury: null }),
    );

    expect(mapped.data).toBeUndefined();
  });

  test("returns undefined data when result date is missing", () => {
    const mapped = mapUpdateJuryResultByCandidacyId(
      buildJuryResultCandidacyFixture({
        jury: {
          ...buildJuryResultCandidacyFixture().jury!,
          dateOfResult: null,
        },
      }),
    );

    expect(mapped.data).toBeUndefined();
  });

  test("returns undefined data when result is missing", () => {
    const mapped = mapUpdateJuryResultByCandidacyId(
      buildJuryResultCandidacyFixture({
        jury: {
          ...buildJuryResultCandidacyFixture().jury!,
          result: null,
        },
      }),
    );

    expect(mapped.data).toBeUndefined();
  });
});
