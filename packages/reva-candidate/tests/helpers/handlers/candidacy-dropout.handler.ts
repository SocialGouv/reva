import {
  createCandidaciesGuardsHandlers,
  createCandidacyGuardsAndDashboardHandlers,
} from "./candidacies/candidacies-guards.handler";

import type { CandidacyEntity } from "@tests/helpers/entities/create-candidacy.entity";

interface CandidacyDropOutHandlersOptions {
  candidacy: CandidacyEntity;
  activeFeaturesForConnectedUser?: string[];
}

export const candidacyDropOutHandlers = ({
  candidacy,
  activeFeaturesForConnectedUser = [],
}: CandidacyDropOutHandlersOptions) => [
  ...createCandidaciesGuardsHandlers({
    candidate: candidacy.candidate,
    candidacies: [candidacy],
    activeFeaturesForConnectedUser,
  }),
  ...createCandidacyGuardsAndDashboardHandlers(candidacy),
];
