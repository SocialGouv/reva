import { describe, expect, test } from "vitest";

import {
  buildDossierDeValidationRowFixture,
  buildDossiersDeValidationPageFixture,
  CANDIDACY_ID,
} from "../__testUtils/fixtures.js";

import { mapGetDossiersDeValidation } from "./getDossiersDeValidation.mapper.js";

describe("mapGetDossiersDeValidation", () => {
  test("maps dossier metadata and pagination info", () => {
    const mapped = mapGetDossiersDeValidation(
      buildDossiersDeValidationPageFixture([
        buildDossierDeValidationRowFixture({
          decision: "COMPLETE",
          dossierDeValidationSentAt: "2025-03-01T09:00:00.000Z",
        }),
      ]),
    );

    expect(mapped.data?.[0]).toMatchObject({
      id: "dossier-1",
      candidatureId: CANDIDACY_ID,
      dateEnvoi: new Date("2025-03-01T09:00:00.000Z").toISOString(),
      statut: "VERIFIE",
      documents: [],
    });
    expect(mapped.info).toEqual({
      totalElements: 1,
      totalPages: 1,
      pageCourante: 1,
    });
  });

  test("maps main and supplementary documents and skips files without preview URL", () => {
    const mapped = mapGetDossiersDeValidation(
      buildDossiersDeValidationPageFixture([
        buildDossierDeValidationRowFixture({
          dossierDeValidationFile: {
            name: "dossier.pdf",
            mimeType: "application/pdf",
            previewUrl: "/files/dossier.pdf",
          },
          dossierDeValidationOtherFiles: [
            {
              name: "piece.pdf",
              mimeType: "application/pdf",
              previewUrl: "/files/piece.pdf",
            },
            {
              name: "ignored.pdf",
              mimeType: "application/pdf",
              previewUrl: null,
            },
          ],
        }),
      ]),
    );

    expect(mapped.data?.[0]?.documents).toEqual([
      {
        type: "DOSSIER_DE_VALIDATION",
        fichier: {
          nom: "dossier.pdf",
          url: "https://api.example.com/files/dossier.pdf",
          typeMime: "application/pdf",
        },
      },
      {
        type: "PIECE_SUPPLEMENTAIRE",
        fichier: {
          nom: "piece.pdf",
          url: "https://api.example.com/files/piece.pdf",
          typeMime: "application/pdf",
        },
      },
    ]);
  });

  test("uses localhost preview URL in local environment", () => {
    process.env.ENVIRONMENT = "local";

    const mapped = mapGetDossiersDeValidation(
      buildDossiersDeValidationPageFixture([
        buildDossierDeValidationRowFixture({
          dossierDeValidationFile: {
            name: "dossier.pdf",
            mimeType: "application/pdf",
            previewUrl: "/files/dossier.pdf",
          },
        }),
      ]),
    );

    expect(mapped.data?.[0]?.documents?.[0]?.fichier?.url).toBe(
      "http://localhost:8080/files/dossier.pdf",
    );
  });
});
