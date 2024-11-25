export const WouldYouLikeToKnowMorePanel = () => (
  <div
    data-testid="candidate-typology-would-you-like-to-know-more-panel"
    className="flex flex-col rounded-2xl border-2 border-dsfrBlue-openBlueFrance p-8 "
  >
    <h3 className="text-dsfrGray-titleGrey text-2xl font-bold">
      <span className="fr-icon-info-line mr-6" aria-hidden="true" />
      Vous ne trouvez pas votre diplôme ?
    </h3>
    <div className="fr-callout !mb-0 flex flex-col items-start">
      <p>
        Du fait de son déploiement progressif, tous les diplômes ne sont pas
        encore couverts par France VAE. De nouveaux diplômes seront ajoutés en
        2024.
      </p>
      <br />
      <a
        href="https://metabase.vae.gouv.fr/public/dashboard/31ce8d3e-1347-4aad-8a82-79a06de6b8a0"
        title="Voir tous les diplômes actuellement - nouvelle fenêtre"
        target="_blank"
      >
        <strong>
          Voir tous les diplômes actuellement disponibles via France VAE
        </strong>
      </a>
      <br />
      <p>
        Si vous ne trouvez pas votre diplôme dans la liste, nous vous invitons à
        vous rapprocher d’un{" "}
        <a
          target="_blank"
          href="https://vae.gouv.fr/savoir-plus/articles/liste-prc/"
          title="point relais conseil - nouvelle fenêtre"
        >
          point relais conseil
        </a>
        , d’un{" "}
        <a
          target="_blank"
          href="https://mon-cep.org/#trouver"
          title="conseiller en évolution professionnelle - nouvelle fenêtre"
        >
          conseiller en évolution professionnelle
        </a>
        , une{" "}
        <a
          target="_blank"
          href="https://www.transitionspro.fr/"
          title="association de transition professionnelle (AT Pro) - nouvelle fenêtre"
        >
          association de transition professionnelle (AT Pro)
        </a>
        .
      </p>
    </div>
  </div>
);
