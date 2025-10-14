import { getActiveFeatures } from "@/helpers/get-actives-features";

import { ProjectHeaderClient } from "./ProjectHeaderClient";

export async function ProjectHeader() {
  const { isFeatureActive } = await getActiveFeatures();
  const isMetabaseDashboardActive = isFeatureActive(
    "SHOW_METABASE_DASHBOARD_VAE_COLLECTIVE",
  );

  return (
    <ProjectHeaderClient
      isMetabaseDashboardActive={isMetabaseDashboardActive}
    />
  );
}
