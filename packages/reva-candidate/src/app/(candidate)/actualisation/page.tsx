"use client";

import { useFeatureFlipping } from "@/components/feature-flipping/featureFlipping";

export default function ActualisationPage() {
  const { isFeatureActive } = useFeatureFlipping();
  const candidacyActualisationFeatureIsActive = isFeatureActive(
    "candidacy_actualisation",
  );

  if (!candidacyActualisationFeatureIsActive) {
    return null;
  }

  return <div>Actualisation</div>;
}
