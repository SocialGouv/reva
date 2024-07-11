export const OrganismCardDistance = ({
  distanceKm,
}: {
  distanceKm?: number | null;
}) => {
  if (distanceKm === undefined || distanceKm === null) return null;
  return (
    <div>
      <span
        className="fr-icon-map-pin-2-fill fr-icon--sm mr-2"
        aria-hidden="true"
      ></span>
      <span className="font-bold text-sm">
        À {distanceKm === 0 ? 0 : distanceKm?.toFixed(1)} km
      </span>
    </div>
  );
};
