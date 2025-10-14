import { getActiveFeatures } from "@/helpers/get-actives-features";

import { PrivateHeaderClient } from "./PrivateHeaderClient";

export async function PrivateHeader() {
  const { isFeatureActive } = await getActiveFeatures();
  const isMetabaseDashboardActive = isFeatureActive(
    "SHOW_METABASE_DASHBOARD_VAE_COLLECTIVE",
  );

  return (
    <PrivateHeaderClient
      isMetabaseDashboardActive={isMetabaseDashboardActive}
    />
  );
}
