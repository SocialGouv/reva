import { addDays, format } from "date-fns";
import {
  ACTUALISATION_THRESHOLD_DAYS,
  CADUQUITE_THRESHOLD_DAYS,
} from "../../banner-thresholds";

export const ActualisationTile = ({
  lastActivityDate,
}: {
  lastActivityDate: number | undefined | null;
}) => {
  if (!lastActivityDate) {
    return null;
  }

  const canActualiseFrom = addDays(
    lastActivityDate,
    ACTUALISATION_THRESHOLD_DAYS,
  );
  const canActualiseUntil = addDays(lastActivityDate, CADUQUITE_THRESHOLD_DAYS);

  return (
    <div
      className="bg-fvae-red-100 text-fvae-red-800 p-6 flex flex-col"
      data-test="actualisation-tile"
    >
      <div className="flex font-bold items-center mb-4">
        <i className="ri-hourglass-fill fr-icon--lg mr-2 transform rotate-45" />
        <span className="text-xl">Actualisation</span>
      </div>
      <p className="mb-2">
        Dernière activité le : {format(lastActivityDate, "dd/MM/yyyy")}
      </p>
      <div>
        <p className="mb-0">Prochaine actualisation prévue :</p>
        <p className="mb-0">
          du {format(canActualiseFrom, "dd/MM/yyyy")} au{" "}
          {format(canActualiseUntil, "dd/MM/yyyy")}
        </p>
      </div>
    </div>
  );
};
