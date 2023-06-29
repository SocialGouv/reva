export const AdmissibleSectorsInfoPanel = ({
  className,
}: {
  className?: string;
}) => (
  <div className={`fr-alert fr-alert--info max-w-[550px] ${className || ""}`}>
    <p className="text-sm">
      Les premières filières éligibles sont : sanitaire et social, grande
      distribution, industrie métallurgique et métiers du sport.
    </p>
    <a
      className="fr-link !text-sm"
      title="Voir tous les diplômes disponibles - ouvre une nouvelle fenêtre"
      target="_blank"
      referrerPolicy="no-referrer"
      href="https://airtable.com/shrTDCbwwBI4xLLo9/tblWDa9HN0cuqLnAl"
    >
      Voir tous les diplômes disponibles
    </a>
  </div>
);
