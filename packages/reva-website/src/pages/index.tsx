import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { useEffect, useState } from "react";

import HomePageV1 from "./(home-page)/(home-page-v1)/HomePageV1";
import HomePageV2 from "./(home-page)/(hope-page-v2)/HomePageV2";

const HomePage = () => {
  const [isHomePageV2Active, setIsHomePageV2Active] = useState(false);
  const { isFeatureActive, status } = useFeatureflipping();

  useEffect(() => {
    if (isFeatureActive("SITE_INSTIT_HOME_PAGE_V2")) {
      setIsHomePageV2Active(true);
    }
  }, [status, isFeatureActive]);

  return isHomePageV2Active ? <HomePageV2 /> : <HomePageV1 />;
};

export default HomePage;
