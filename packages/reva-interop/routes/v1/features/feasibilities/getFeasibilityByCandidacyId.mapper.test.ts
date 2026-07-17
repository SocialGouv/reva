import { describe, expect, test } from "vitest";

import { buildFeasibilityCandidacyFixture } from "../__testUtils/fixtures.js";

import { mapGetFeasibilityByCandidacyId } from "./getFeasibilityByCandidacyId.mapper.js";

describe("mapGetFeasibilityByCandidacyId", () => {
  test("prioritizes ARCHIVE candidacy status over feasibility decision", () => {
    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({
        status: "ARCHIVE",
        feasibility: {
          ...buildFeasibilityCandidacyFixture().feasibility!,
          decision: "ADMISSIBLE",
        },
      }),
    );

    expect(mapped.data?.statut).toBe("ARCHIVE");
  });

  test("maps candidacy drop-out to ABANDONNE", () => {
    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({
        candidacyDropOut: { createdAt: "2025-02-01T00:00:00.000Z" },
        feasibility: {
          ...buildFeasibilityCandidacyFixture().feasibility!,
          decision: "ADMISSIBLE",
        },
      }),
    );

    expect(mapped.data?.statut).toBe("ABANDONNE");
  });

  test("returns undefined data when feasibility decision is unknown", () => {
    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({
        feasibility: {
          ...buildFeasibilityCandidacyFixture().feasibility!,
          decision: "UNKNOWN_DECISION",
        },
      }),
    );

    expect(mapped.data).toBeUndefined();
  });

  test("returns undefined data when feasibility is missing", () => {
    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({ feasibility: null }),
    );

    expect(mapped.data).toBeUndefined();
  });

  test("maps experience duration and dates", () => {
    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({
        experiences: [
          {
            title: "Développeur",
            description: "Applications web",
            duration: "betweenOneAndThreeYears",
            startedAt: "2020-01-01T00:00:00.000Z",
          },
        ],
      }),
    );

    expect(mapped.data?.experiences).toEqual([
      {
        titre: "Développeur",
        duree: "ENTRE_UN_ET_TROIS_ANS",
        description: "Applications web",
        dateDemarrage: new Date("2020-01-01T00:00:00.000Z").toISOString(),
      },
    ]);
  });

  test("assembles uploaded PDF documents and skips files without preview URL", () => {
    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({
        feasibility: {
          ...buildFeasibilityCandidacyFixture().feasibility!,
          feasibilityFormat: "UPLOADED_PDF",
          feasibilityUploadedPdf: {
            feasibilityFile: {
              name: "dff.pdf",
              mimeType: "application/pdf",
              previewUrl: "/files/dff.pdf",
            },
            IDFile: {
              name: "id.pdf",
              mimeType: "application/pdf",
              previewUrl: null,
            },
            documentaryProofFile: null,
            certificateOfAttendanceFile: null,
          },
        },
      }),
    );

    expect(mapped.data?.documents).toEqual([
      {
        type: "DOSSIER_DE_FAISABILITE",
        fichier: {
          nom: "dff.pdf",
          url: "https://api.example.com/files/dff.pdf",
          typeMime: "application/pdf",
        },
      },
    ]);
  });

  test("assembles dematerialized documents, attachments and competence blocs", () => {
    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({
        feasibility: {
          ...buildFeasibilityCandidacyFixture().feasibility!,
          feasibilityFormat: "DEMATERIALIZED",
          dematerializedFeasibilityFile: {
            blocsDeCompetences: [
              {
                certificationCompetenceBloc: {
                  id: "bloc-1",
                  code: "BC1",
                  label: "Bloc compétence 1",
                },
              },
            ],
            dffFile: {
              name: "dff.pdf",
              mimeType: "application/pdf",
              previewUrl: "/files/dff.pdf",
            },
            swornStatementFile: {
              name: "attestation.pdf",
              mimeType: "application/pdf",
              previewUrl: "/files/attestation.pdf",
            },
            attachments: [
              {
                id: "att-1",
                type: "ID_CARD",
                file: {
                  name: "id.pdf",
                  mimeType: "application/pdf",
                  previewUrl: "/files/id.pdf",
                },
              },
              null,
            ],
          },
        },
      }),
    );

    expect(mapped.data?.blocsDeCompetences).toEqual([
      {
        id: "bloc-1",
        code: "BC1",
        libelle: "Bloc compétence 1",
      },
    ]);
    expect(mapped.data?.documents).toEqual([
      {
        type: "DOSSIER_DE_FAISABILITE",
        fichier: {
          nom: "dff.pdf",
          url: "https://api.example.com/files/dff.pdf",
          typeMime: "application/pdf",
        },
      },
      {
        type: "ATTESTATION_SUR_L_HONNEUR",
        fichier: {
          nom: "attestation.pdf",
          url: "https://api.example.com/files/attestation.pdf",
          typeMime: "application/pdf",
        },
      },
      {
        type: "PIECE_D_IDENTITE",
        fichier: {
          nom: "id.pdf",
          url: "https://api.example.com/files/id.pdf",
          typeMime: "application/pdf",
        },
      },
    ]);
  });

  test("uses localhost preview URL in local environment", () => {
    process.env.ENVIRONEMENT = "local";

    const mapped = mapGetFeasibilityByCandidacyId(
      buildFeasibilityCandidacyFixture({
        feasibility: {
          ...buildFeasibilityCandidacyFixture().feasibility!,
          feasibilityFormat: "UPLOADED_PDF",
          feasibilityUploadedPdf: {
            feasibilityFile: {
              name: "dff.pdf",
              mimeType: "application/pdf",
              previewUrl: "/files/dff.pdf",
            },
            IDFile: null,
            documentaryProofFile: null,
            certificateOfAttendanceFile: null,
          },
        },
      }),
    );

    expect(mapped.data?.documents?.[0]?.fichier?.url).toBe(
      "http://localhost:8080/files/dff.pdf",
    );
  });
});
