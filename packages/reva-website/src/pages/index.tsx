import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

import HomePageV1 from "./(home-page)/HomePageV1";
import HomePageV2 from "./(home-page)/HomePageV2";

const HomePage = () => {
  const { isFeatureActive } = useFeatureflipping();
  const isHomePageV2Active = isFeatureActive("SITE_INSTIT_HOME_PAGE_V2");

  return isHomePageV2Active ? <HomePageV2 /> : <HomePageV1 />;
};

export default HomePage;
