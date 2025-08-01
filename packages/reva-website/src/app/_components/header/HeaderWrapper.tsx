import { getActiveFeatures } from "@/utils/featureFlipping";

import { Header } from "./Header";

export const HeaderWrapper = async () => {
  const activeFeatures = await getActiveFeatures();
  const showNewProMenu = activeFeatures.includes("WEBSITE_PRO_MENU_DROPDOWN");
  const showVaeCollective = activeFeatures.includes("VAE_COLLECTIVE");

  return (
    <Header
      showNewProMenu={showNewProMenu}
      showVaeCollective={showVaeCollective}
    />
  );
};
