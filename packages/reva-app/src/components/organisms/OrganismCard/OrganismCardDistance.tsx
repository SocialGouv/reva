export const OrganismCardDistance = ({
  distanceKm,
}: {
  distanceKm: number;
}) => {
  return (
    <div>
      <span
        className="fr-icon-map-pin-2-fill fr-icon--sm mr-2"
        aria-hidden="true"
      ></span>
      <span>{distanceKm === 0 ? 0 : distanceKm.toFixed(2)} km</span>
    </div>
  );
};
