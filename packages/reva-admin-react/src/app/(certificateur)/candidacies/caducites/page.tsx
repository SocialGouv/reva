"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CaducitesPage() {
  const { isFeatureActive } = useFeatureflipping();
  const router = useRouter();
  const isCandidacyActualisationActive = isFeatureActive(
    "candidacy_actualisation",
  );

  useEffect(() => {
    if (!isCandidacyActualisationActive) {
      router.push("/candidacies/feasibilities/?page=1&CATEGORY=ALL");
    }
  }, [isCandidacyActualisationActive, router]);

  return <div>CaducitesPage</div>;
}
