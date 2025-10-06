import { format } from "date-fns";
import { graphql } from "next/experimental/testmode/playwright/msw";

import dashboardQuery from "@tests/fixtures/candidate/dashboard-query.json";
import homeQuery from "@tests/fixtures/candidate/home-query.json";
import layoutQuery from "@tests/fixtures/candidate/layout-query.json";

import {
  CandidacyStatusStep,
  Candidate_GetCandidateWithCandidacyForDashboardQuery,
  Candidate_GetCandidateWithCandidacyForLayoutQuery,
  DossierDeValidationDecision,
  FeasibilityDecision,
  FeasibilityFormat,
  JuryResult,
  TypeAccompagnement,
} from "@/graphql/generated/graphql";

import { data } from "../shared/msw";

import { DossierDeValidationFixture } from "./dossier-de-validation/dossier-de-validation";

type DashboardQuery = Candidate_GetCandidateWithCandidacyForDashboardQuery;
type LayoutQuery = Candidate_GetCandidateWithCandidacyForLayoutQuery;

interface CreateCandidateHandlersOptions {
  activeFeaturesForConnectedUser?: string[];
  typeAccompagnement?: TypeAccompagnement;
  status?: CandidacyStatusStep;
  readyForJuryEstimatedAt?: Date;
  feasibilityDecision?: FeasibilityDecision;
  juryResult?: JuryResult;
  activeDossierDeValidation?: DossierDeValidationFixture;
  goalsCount?: number;
  experiencesCount?: number;
  hasOrganism?: boolean;
  hasSelectedCertification?: boolean;
  candidacyAlreadySubmitted?: boolean;
  feasibility?: {
    feasibilityFileSentAt?: number | null;
    feasibilityFormat?: FeasibilityFormat;
    dematerializedFeasibilityFile?: {
      sentToCandidateAt?: number | null;
      candidateConfirmationAt?: number | null;
      swornStatementFileId?: string | null;
    } | null;
  };
  activeDossierDeValidationDecision?: DossierDeValidationDecision | null;
}

export const createCandidateHandlers = (
  options: CreateCandidateHandlersOptions = {},
) => {
  const {
    activeFeaturesForConnectedUser = [],
    typeAccompagnement,
    status,
    readyForJuryEstimatedAt,
    feasibilityDecision,
    juryResult,
    activeDossierDeValidation,
    goalsCount,
    experiencesCount,
    hasOrganism,
    hasSelectedCertification,
    candidacyAlreadySubmitted,
    feasibility,
    activeDossierDeValidationDecision,
  } = options;

  const dashboardData = structuredClone(dashboardQuery) as {
    data: DashboardQuery;
  };
  const layoutData = structuredClone(layoutQuery) as { data: LayoutQuery };

  const candidacy =
    dashboardData.data.candidate_getCandidateWithCandidacy.candidacy;
  type CandidacyType = typeof candidacy;

  if (typeAccompagnement) {
    candidacy.typeAccompagnement = typeAccompagnement;
    layoutData.data.candidate_getCandidateWithCandidacy.candidacy.typeAccompagnement =
      typeAccompagnement;
  }

  if (status) {
    candidacy.status = status;
  }

  if (readyForJuryEstimatedAt) {
    candidacy.readyForJuryEstimatedAt = format(
      readyForJuryEstimatedAt,
      "yyyy-MM-dd",
    );
  }

  if (feasibilityDecision) {
    candidacy.feasibility = {
      decision: feasibilityDecision,
      feasibilityFileSentAt: null,
      feasibilityFormat: "DEMATERIALIZED",
      dematerializedFeasibilityFile: null,
      certificationAuthority: null,
    };
  }

  if (juryResult) {
    candidacy.jury = {
      result: juryResult,
      isResultTemporary: null,
      dateOfSession: Date.now(),
      timeOfSession: null,
      timeSpecified: null,
    };
  }

  if (activeDossierDeValidation) {
    candidacy.activeDossierDeValidation = activeDossierDeValidation;
  }

  if (typeof goalsCount === "number") {
    candidacy.goals = Array.from({ length: goalsCount }).map((_, i) => ({
      id: `goal-${i + 1}`,
    }));
  }

  if (typeof experiencesCount === "number") {
    candidacy.experiences = Array.from({ length: experiencesCount }).map(
      (_, i) => ({ id: `exp-${i + 1}` }),
    );
  }

  if (typeof hasOrganism === "boolean") {
    const organismObj: NonNullable<CandidacyType["organism"]> = {
      id: candidacy.organism?.id || "org-1",
      label: candidacy.organism?.label || "Org Label",
      contactAdministrativeEmail:
        candidacy.organism?.contactAdministrativeEmail || "org@example.test",
      contactAdministrativePhone:
        candidacy.organism?.contactAdministrativePhone || "0102030405",
      nomPublic: candidacy.organism?.nomPublic || "Org Public",
      emailContact: candidacy.organism?.emailContact || "contact@example.test",
      telephone: candidacy.organism?.telephone || "0102030405",
      adresseNumeroEtNomDeRue:
        candidacy.organism?.adresseNumeroEtNomDeRue || "1 rue Test",
      adresseInformationsComplementaires:
        candidacy.organism?.adresseInformationsComplementaires || "",
      adresseCodePostal: candidacy.organism?.adresseCodePostal || "75000",
      adresseVille: candidacy.organism?.adresseVille || "Paris",
    };
    candidacy.organism = hasOrganism
      ? organismObj
      : (null as CandidacyType["organism"]);
  }

  if (typeof hasSelectedCertification === "boolean") {
    const certObj: NonNullable<CandidacyType["certification"]> = {
      id: candidacy.certification?.id || "cert-1",
      label: candidacy.certification?.label || "Certification Label",
      codeRncp: candidacy.certification?.codeRncp || "RNCP0000",
    };
    candidacy.certification = hasSelectedCertification
      ? certObj
      : (null as CandidacyType["certification"]);
  }

  if (typeof candidacyAlreadySubmitted === "boolean") {
    candidacy.sentAt = candidacyAlreadySubmitted ? Date.now() : null;
  }

  const feasibilityInput = feasibility;

  if (feasibilityInput) {
    const feasibilityObj: NonNullable<CandidacyType["feasibility"]> = {
      decision:
        feasibilityDecision || candidacy.feasibility?.decision || "PENDING",
      feasibilityFileSentAt:
        feasibilityInput.feasibilityFileSentAt ??
        candidacy.feasibility?.feasibilityFileSentAt ??
        null,
      feasibilityFormat:
        feasibilityInput.feasibilityFormat ||
        candidacy.feasibility?.feasibilityFormat ||
        "DEMATERIALIZED",
      dematerializedFeasibilityFile: {
        swornStatementFileId:
          feasibilityInput.dematerializedFeasibilityFile
            ?.swornStatementFileId ??
          candidacy.feasibility?.dematerializedFeasibilityFile
            ?.swornStatementFileId ??
          null,
        candidateConfirmationAt:
          feasibilityInput.dematerializedFeasibilityFile
            ?.candidateConfirmationAt ??
          candidacy.feasibility?.dematerializedFeasibilityFile
            ?.candidateConfirmationAt ??
          null,
        sentToCandidateAt:
          feasibilityInput.dematerializedFeasibilityFile?.sentToCandidateAt ??
          candidacy.feasibility?.dematerializedFeasibilityFile
            ?.sentToCandidateAt ??
          null,
      },
      certificationAuthority:
        candidacy.feasibility?.certificationAuthority || null,
    };
    candidacy.feasibility = feasibilityObj as CandidacyType["feasibility"];
  }

  if (
    !activeDossierDeValidation &&
    typeof activeDossierDeValidationDecision !== "undefined"
  ) {
    candidacy.activeDossierDeValidation =
      activeDossierDeValidationDecision === null
        ? (null as CandidacyType["activeDossierDeValidation"])
        : ({
            decision: activeDossierDeValidationDecision,
          } as NonNullable<CandidacyType["activeDossierDeValidation"]>);
  }

  const fvae = graphql.link("https://reva-api/api/graphql");

  return [
    fvae.query(
      "candidate_getCandidateWithCandidacyForLayout",
      data(layoutData),
    ),

    fvae.query(
      "candidate_getCandidateWithCandidacyForDashboard",
      data(dashboardData),
    ),

    fvae.query("candidate_getCandidateWithCandidacyForHome", data(homeQuery)),

    fvae.mutation(
      "candidate_loginWithToken",
      data({ candidate_loginWithToken: null }),
    ),

    fvae.query(
      "activeFeaturesForConnectedUser",
      data({
        data: {
          activeFeaturesForConnectedUser,
        },
      }),
    ),
  ];
};
