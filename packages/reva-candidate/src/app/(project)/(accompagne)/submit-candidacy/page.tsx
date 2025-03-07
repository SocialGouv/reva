"use client";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";
import SubmitCandidacyDashboard from "./SubmitCandidacyDashboard";
import SubmitCandidacyLegacy from "./SubmitCandidacyLegacy";

export default function SubmitCandidacy() {
  const { isFeatureActive } = useFeatureFlipping();
  const isDashboardCandidateActive = isFeatureActive("CANDIDATE_DASHBOARD");

  if (isDashboardCandidateActive) {
    return <SubmitCandidacyDashboard />;
  }

  return <SubmitCandidacyLegacy />;
}
