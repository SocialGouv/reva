"use client";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { redirect } from "next/navigation";

const AgenciesSettingsPage = () => {
  const { isFeatureActive } = useFeatureflipping();

  redirect(isFeatureActive("AAP_INTERVENTION_ZONE_UPDATE") ? "./v2" : "./v1");
};

export default AgenciesSettingsPage;
