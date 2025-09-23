import { format } from "date-fns";
import { graphql } from "next/experimental/testmode/playwright/msw";

import {
  TypeAccompagnement,
  CandidacyStatusStep,
  FeasibilityDecision,
  JuryResult,
  Candidate_GetCandidateWithCandidacyForDashboardQuery,
  Candidate_GetCandidateWithCandidacyForLayoutQuery,
} from "@/graphql/generated/graphql";

import dashboardQuery from "@tests/fixtures/candidate/dashboard-query.json";
import homeQuery from "@tests/fixtures/candidate/home-query.json";
import layoutQuery from "@tests/fixtures/candidate/layout-query.json";

import { DossierDeValidationFixture } from "./dossier-de-validation/dossier-de-validation";
import { data } from "../shared/msw";

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
  } = options;

  const dashboardData = structuredClone(dashboardQuery) as {
    data: DashboardQuery;
  };
  const layoutData = structuredClone(layoutQuery) as { data: LayoutQuery };

  const candidacy =
    dashboardData.data.candidate_getCandidateWithCandidacy.candidacy;

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
