export const AdmissibleSectorsInfoPanel = ({
  className,
}: {
  className?: string;
}) => (
  <div
    className={`fr-alert fr-alert--warning max-w-[580px] ${className || ""}`}
  >
    <h3 className="fr-alert__title">Attention</h3>
    <p>Tous les diplômes ne sont pas encore couverts par France VAE.</p>
    <p className="font-semibold">
      Seules les filières suivantes sont actuellement éligibles :
    </p>
    <ul>
      <li>sanitaire et social,</li>
      <li>grande distribution,</li>
      <li>industrie métallurgique,</li>
      <li>métiers du sport.</li>
    </ul>
    <p>
      <a
        className="fr-link font-semibold !text-sm"
        title="Voir tous les diplômes disponibles - ouvre une nouvelle fenêtre"
        target="_blank"
        referrerPolicy="no-referrer"
        href="https://airtable.com/shrTDCbwwBI4xLLo9/tblWDa9HN0cuqLnAl"
      >
        Consultez les diplômes actuellement disponibles via France VAE
      </a>
    </p>
    <p>
      Si le diplôme que vous visez ne fait pas partie de cette liste, veuillez
      consulter le site{" "}
      <a href="https://vae.centre-inffo.fr">vae.centre-inffo.fr</a> pour
      continuer votre parcours VAE.
    </p>
  </div>
);
