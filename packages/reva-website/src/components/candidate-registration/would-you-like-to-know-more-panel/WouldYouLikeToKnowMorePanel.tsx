import CallOut from "@codegouvfr/react-dsfr/CallOut";

export const WouldYouLikeToKnowMorePanel = () => (
  <div
    data-testid="candidate-typology-would-you-like-to-know-more-panel"
    className="flex flex-col rounded-2xl border-2 border-dsfrBlue-openBlueFrance p-8 "
  >
    {" "}
    <h3 className="text-dsfrGray-titleGrey text-2xl font-bold">
      <span className="fr-icon-info-line mr-6" aria-hidden="true" />
      En savoir plus
    </h3>
    <CallOut className="!mb-0">
      <p>
        Du fait de son déploiement progressif, tous les diplômes ne sont pas
        encore couverts par France VAE.
      </p>
      <br />
      <p>
        Si vous ne trouvez pas votre diplôme dans la liste, nous vous invitons à
        vous rapprocher d’un{" "}
        <a
          href="https://vae.centre-inffo.fr/?page=carte-prc"
          title="point relais conseil - nouvelle fenêtre"
        >
          point relais conseil
        </a>
        , d’un{" "}
        <a
          href="https://mon-cep.org/#trouver"
          title="conseiller en évolution professionnelle - nouvelle fenêtre"
        >
          conseiller en évolution professionnelle
        </a>
        , une{" "}
        <a
          href="https://www.transitionspro.fr/"
          title="association de transition professionnelle (AT Pro) - nouvelle fenêtre"
        >
          association de transition professionnelle (AT Pro)
        </a>
        .
      </p>
    </CallOut>
  </div>
);
