import { getActiveFeatures } from "@/helpers/get-active-features";

import { Header } from "./Header";

export async function HeaderWithFeatures() {
  const { isFeatureActive, activeFeatures } = await getActiveFeatures();

  const isMetabaseDashboardActive = isFeatureActive(
    activeFeatures,
    "SHOW_METABASE_DASHBOARD_VAE_COLLECTIVE",
  );

  return <Header isMetabaseDashboardActive={isMetabaseDashboardActive} />;
}
