import { GetGqlResponseType, GetGqlRowType } from "../../../../utils/types.js";
import { getCandidacyById } from "../candidacies/getCandidacyById.js";
import { getDossiersDeValidation } from "../dossiersDeValidation/getDossiersDeValidation.js";
import { getFeasibilityByCandidacyId } from "../feasibilities/getFeasibilityByCandidacyId.js";
import { getJuryByCandidacyId } from "../juries/getJuryByCandidacyId.js";
import { scheduleJurySessionByCandidacyId } from "../juries/scheduleJurySessionByCandidacyId.js";
import { updateJuryResultByCandidacyId } from "../juries/updateJuryResultByCandidacyId.js";

export const CANDIDACY_ID = "00a9fc60-bd2d-434e-9e97-97e029cbcd74";

export const buildCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): NonNullable<Awaited<ReturnType<typeof getCandidacyById>>> => ({
  id: CANDIDACY_ID,
  status: "ACTIVE",
  feasibilityFormat: null,
  typology: "SALARIE",
  organism: null,
  isCertificationPartial: false,
  certification: {
    label: "BTS Informatique",
    codeRncp: "RNCP12345",
  },
  candidate: {
    firstname: "Jean",
    firstname2: null,
    firstname3: null,
    middleNames: null,
    givenName: null,
    birthCity: "Lyon",
    birthDepartment: { code: "69", label: "Rhône" },
    birthdate: "1990-05-15",
    nationality: "FR",
    niveauDeFormationLePlusEleve: null,
    highestDegree: null,
    highestDegreeLabel: null,
    lastname: "Dupont",
    gender: "man",
    email: "jean.dupont@example.com",
    phone: "0601020304",
    city: "Paris",
    zip: "75001",
    street: "1 rue de Rivoli",
    addressComplement: null,
    country: { label: "France", isoCode: "fr" },
    department: { code: "75", label: "Paris" },
  },
  ...overrides,
});

export const buildFeasibilityCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof getFeasibilityByCandidacyId> => ({
  id: CANDIDACY_ID,
  status: "ACTIVE",
  candidacyDropOut: null,
  experiences: [],
  feasibility: {
    decision: "PENDING",
    feasibilityFileSentAt: "2025-01-15T10:00:00.000Z",
    feasibilityFormat: "UPLOADED_PDF",
    feasibilityUploadedPdf: null,
    dematerializedFeasibilityFile: null,
  },
  ...overrides,
});

export const buildJuryCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof getJuryByCandidacyId> => ({
  id: CANDIDACY_ID,
  jury: {
    dateOfSession: new Date("2026-12-01"),
  },
  ...overrides,
});

export const buildJurySessionCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof scheduleJurySessionByCandidacyId> => ({
  id: CANDIDACY_ID,
  jury: {
    dateOfSession: new Date("2026-08-15T14:30:00"),
    timeOfSession: null,
    timeSpecified: true,
    addressOfSession: "10 avenue de la République",
    informationOfSession: "Prévoir une pièce d'identité",
  },
  ...overrides,
});

export const buildJuryResultCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof updateJuryResultByCandidacyId> => ({
  id: CANDIDACY_ID,
  jury: {
    id: "jury-1",
    result: "FAILURE",
    dateOfResult: new Date("2026-06-01T10:00:00.000Z").getTime(),
    informationOfResult: "Résultat du jury",
    juryResultByCompetenceBlocs: [
      {
        id: "bloc-result-1",
        isCompetenceBlocValidated: true,
        competenceBloc: {
          id: "bloc-1",
          code: "BC1",
          label: "Bloc 1",
        },
      },
    ],
  },
  ...overrides,
});

export const buildDossierDeValidationRowFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlRowType<typeof getDossiersDeValidation> => ({
  id: "dossier-1",
  decision: "PENDING",
  dossierDeValidationSentAt: "2025-03-01T09:00:00.000Z",
  candidacy: { id: CANDIDACY_ID },
  dossierDeValidationFile: null,
  dossierDeValidationOtherFiles: [],
  ...overrides,
});

export const buildDossiersDeValidationPageFixture = (
  rows: GetGqlRowType<typeof getDossiersDeValidation>[] = [
    buildDossierDeValidationRowFixture(),
  ],
): GetGqlResponseType<typeof getDossiersDeValidation> => ({
  rows,
  info: {
    totalRows: rows.length,
    currentPage: 1,
    totalPages: 1,
  },
});
