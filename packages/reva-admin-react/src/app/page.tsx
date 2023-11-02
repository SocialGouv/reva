"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

export default function Home() {
  const { activeFeatures } = useFeatureflipping();
  return (
    <div className="text-white ml-4">
      Active features: {activeFeatures.join(", ")}
    </div>
  );
}
