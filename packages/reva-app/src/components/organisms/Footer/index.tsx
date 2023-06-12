export const Footer = () => (
  <footer className="fr-footer" role="contentinfo" id="footer">
    <div className="fr-container">
      <div className="fr-footer__body">
        <div className="fr-footer__brand fr-enlarge-link">
          <a href="/" title="Accueil - France VAE">
            <p className="fr-logo">
              République
              <br /> Française
            </p>
          </a>
        </div>
        <div className="fr-footer__content">
          <p className="fr-footer__content-desc">France VAE</p>
          <ul className="fr-footer__content-list">
            <li className="fr-footer__content-item">
              <a
                className="fr-footer__content-link"
                target="_blank"
                href="https://legifrance.gouv.fr"
                aria-label="legifrance.gouv.fr nouvelle page"
                rel="noreferrer"
              >
                legifrance.gouv.fr
              </a>
            </li>
            <li className="fr-footer__content-item">
              <a
                className="fr-footer__content-link"
                target="_blank"
                href="https://gouvernement.fr"
                aria-label="gouvernement.fr nouvelle page"
                rel="noreferrer"
              >
                gouvernement.fr
              </a>
            </li>
            <li className="fr-footer__content-item">
              <a
                className="fr-footer__content-link"
                target="_blank"
                href="https://service-public.fr"
                aria-label="service-public.fr nouvelle page"
                rel="noreferrer"
              >
                service-public.fr
              </a>
            </li>
            <li className="fr-footer__content-item">
              <a
                className="fr-footer__content-link"
                target="_blank"
                href="https://data.gouv.fr"
                aria-label="data.gouv.fr nouvelle page"
                rel="noreferrer"
              >
                data.gouv.fr
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="fr-footer__bottom">
        <ul className="fr-footer__bottom-list">
          <li className="fr-footer__bottom-item">
            <span className="fr-footer__bottom-link">
              Accessibilité: non conforme
            </span>
          </li>
        </ul>
        <div className="fr-footer__bottom-copy">
          <p>
            Sauf mention contraire, tous les contenus de ce site sont sous{" "}
            <a
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="_blank"
              aria-label="licence etalab-2.0 nouvelle page"
              rel="noreferrer"
            >
              licence etalab-2.0
            </a>
          </p>
        </div>
      </div>
    </div>
  </footer>
);
