import { type Page } from "next/experimental/testmode/playwright/msw";

import { waitGraphQL } from "../network/requests";

import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
} from "./candidacies/candidacies-guards.handler";

import type { CandidacyEntity } from "../entities/create-candidacy.entity";

export interface DashboardHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}

const dashboardWait = async (page: Page, candidacy: CandidacyEntity) => {
  await Promise.all([
    waitGraphQL(page, "candidate_getCandidateForCandidatesGuard"),
    waitGraphQL(page, "candidate_getCandidateForUserDropdown"),
    waitGraphQL(page, "getCandidateByIdForCandidateGuard"),
    waitGraphQL(
      page,
      "candidate_getCandidateByIdWithCandidaciesForCandidaciesGuard",
    ),
  ]);

  await page.goto(
    `/candidat/candidates/${candidacy?.candidate?.id}/candidacies/${candidacy.id}/`,
  );

  await Promise.all([
    waitGraphQL(page, "getCandidacyByIdForCandidacyGuard"),
    waitGraphQL(page, "activeFeaturesForConnectedUser"),
    waitGraphQL(page, "getCandidacyByIdWithCandidate"),
    waitGraphQL(page, "getCandidacyByIdForDashboard"),
  ]);
};

export const dashboardHandlers = ({
  candidacy,
  activeFeaturesForConnectedUser = [],
}: DashboardHandlersOptions) => {
  return {
    handlers: [
      ...createCandidaciesGuardsHandlers({
        candidate: candidacy.candidate,
        candidacies: [candidacy],
        activeFeaturesForConnectedUser,
      }),
      ...createCandidacyGuardsAndDashboardHandlers(candidacy),
    ],
    dashboardWait: (page: Page) => dashboardWait(page, candidacy),
  };
};
