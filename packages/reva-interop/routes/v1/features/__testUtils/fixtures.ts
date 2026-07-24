import { GetGqlResponseType, GetGqlRowType } from "../../../../utils/types.js";
import { getCandidacyById } from "../candidacies/getCandidacyById.js";
import { getDossierDeValidationByCandidacyId } from "../dossiersDeValidation/getDossierDeValidationByCandidacyId.js";
import { getDossierDeValidationHistoryByCandidacyId } from "../dossiersDeValidation/getDossierDeValidationHistoryByCandidacyId.js";
import { getDossiersDeValidation } from "../dossiersDeValidation/getDossiersDeValidation.js";
import { getFeasibilities } from "../feasibilities/getFeasibilities.js";
import { getFeasibilityByCandidacyId } from "../feasibilities/getFeasibilityByCandidacyId.js";
import { getFeasibilityHistoryByCandidacyId } from "../feasibilities/getFeasibilityHistoryByCandidacyId.js";
import { getJuries } from "../juries/getJuries.js";
import { getJuryByCandidacyId } from "../juries/getJuryByCandidacyId.js";
import { scheduleJurySessionByCandidacyId } from "../juries/scheduleJurySessionByCandidacyId.js";
import { updateJuryResultByCandidacyId } from "../juries/updateJuryResultByCandidacyId.js";

export const CANDIDACY_ID = "00a9fc60-bd2d-434e-9e97-97e029cbcd74";

export const buildCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): NonNullable<Awaited<ReturnType<typeof getCandidacyById>>> => ({
  id: CANDIDACY_ID,
  status: "PROJET",
  feasibilityFormat: "DEMATERIALIZED",
  typology: "SALARIE_PRIVE",
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
  status: "PROJET",
  candidacyDropOut: null,
  experiences: [],
  feasibility: {
    decision: "PENDING",
    feasibilityFileSentAt: new Date("2025-01-15T10:00:00.000Z").getTime(),
    feasibilityFormat: "UPLOADED_PDF",
    feasibilityUploadedPdf: null,
    dematerializedFeasibilityFile: null,
  },
  ...overrides,
});

export const buildFeasibilityHistoryFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof getFeasibilityHistoryByCandidacyId> => ({
  id: CANDIDACY_ID,
  feasibility: {
    feasibilityFormat: "UPLOADED_PDF",
    decision: "COMPLETE",
    decisionComment: "Dossier complet",
    decisionSentAt: new Date("2025-02-01T09:00:00.000Z").getTime(),
    decisionFile: null,
    history: [
      {
        id: "feasibility-history-1",
        decision: "PENDING",
        decisionComment: null,
        decisionSentAt: new Date("2025-01-15T09:00:00.000Z").getTime(),
        decisionFile: null,
      },
    ],
  },
  ...overrides,
});

const buildFeasibilityRowFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlRowType<typeof getFeasibilities> => ({
  id: "feasibility-1",
  candidacy: {
    id: CANDIDACY_ID,
    status: "PROJET",
    cohorteVaeCollective: null,
    candidacyDropOut: null,
    experiences: [],
  },
  feasibilityFileSentAt: new Date("2025-01-15T10:00:00.000Z").getTime(),
  decision: "PENDING",
  feasibilityFormat: "UPLOADED_PDF",
  feasibilityUploadedPdf: null,
  dematerializedFeasibilityFile: null,
  ...overrides,
});

export const buildFeasibilitiesPageFixture = (
  rows: GetGqlRowType<typeof getFeasibilities>[] = [
    buildFeasibilityRowFixture(),
  ],
): GetGqlResponseType<typeof getFeasibilities> => ({
  rows,
  info: {
    totalRows: rows.length,
    currentPage: 1,
    totalPages: 1,
  },
});

export const buildJuryCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof getJuryByCandidacyId> => ({
  id: CANDIDACY_ID,
  jury: {
    dateOfSession: new Date("2026-12-01").getTime(),
  },
  ...overrides,
});

export const buildJurySessionCandidacyFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof scheduleJurySessionByCandidacyId> => ({
  id: CANDIDACY_ID,
  jury: {
    dateOfSession: new Date("2026-08-15T14:30:00").getTime(),
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
  dossierDeValidationSentAt: new Date("2025-03-01T09:00:00.000Z").getTime(),
  candidacy: { id: CANDIDACY_ID },
  dossierDeValidationFile: {
    name: "dossier-de-validation.pdf",
    mimeType: "application/pdf",
    previewUrl: null,
  },
  dossierDeValidationOtherFiles: [],
  ...overrides,
});

export const buildDossierDeValidationFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof getDossierDeValidationByCandidacyId> => ({
  id: CANDIDACY_ID,
  activeDossierDeValidation: {
    id: "dossier-validation-1",
    dossierDeValidationSentAt: new Date("2025-03-01T09:00:00.000Z").getTime(),
    decision: "COMPLETE",
    dossierDeValidationFile: {
      name: "dossier-de-validation.pdf",
      mimeType: "application/pdf",
      previewUrl: null,
    },
    dossierDeValidationOtherFiles: [],
  },
  ...overrides,
});

export const buildDossierDeValidationHistoryFixture = (
  overrides: Record<string, unknown> = {},
): GetGqlResponseType<typeof getDossierDeValidationHistoryByCandidacyId> => ({
  id: CANDIDACY_ID,
  activeDossierDeValidation: {
    decision: "COMPLETE",
    decisionComment: "Dossier vérifié",
    decisionSentAt: new Date("2025-03-05T09:00:00.000Z").getTime(),
  },
  historyDossierDeValidation: [
    {
      decision: "INCOMPLETE",
      decisionComment: "Dossier signalé",
      decisionSentAt: new Date("2025-02-20T09:00:00.000Z").getTime(),
    },
  ],
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
