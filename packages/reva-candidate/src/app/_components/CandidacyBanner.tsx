import { ActualisationBanner } from "./ActualisationBanner";
import { CaduqueBanner } from "./CaduqueBanner";
import { WelcomeBanner } from "./WelcomeBanner";

export const CandidacyBanner = ({
  displayCaduqueWarning,
  displayActualisationWarning,
  lastActivityDate,
}: {
  displayCaduqueWarning: boolean;
  displayActualisationWarning: boolean;
  lastActivityDate: number;
}) => {
  if (displayCaduqueWarning) {
    return <CaduqueBanner />;
  }

  if (displayActualisationWarning) {
    return <ActualisationBanner lastActivityDate={lastActivityDate} />;
  }

  return <WelcomeBanner />;
};
