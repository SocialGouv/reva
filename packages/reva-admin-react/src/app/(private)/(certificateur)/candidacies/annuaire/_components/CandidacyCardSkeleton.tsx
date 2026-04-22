export const CandidacyCardSkeleton = () => {
  return (
    <li className="fr-card shadow-lifted border-none list-none">
      <div className="fr-card__body">
        <div className="fr-card__content">
          <h3 className="fr-card__title">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
          </h3>
          <p className="fr-card__desc">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
            </div>
          </p>
          <div className="fr-card__start mt-4">
            <ul className="fr-badges-group flex gap-2">
              <li>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-24" />
              </li>
              <li>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </li>
  );
};
