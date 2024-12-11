import { ActualisationWarning } from "./ActualisationWarning";
import { CaduqueWarning } from "./CaduqueWarning";
import { WelcomeMessage } from "./WelcomeMessage";

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
    return <CaduqueWarning />;
  }

  if (displayActualisationWarning) {
    return <ActualisationWarning lastActivityDate={lastActivityDate} />;
  }

  return <WelcomeMessage />;
};
