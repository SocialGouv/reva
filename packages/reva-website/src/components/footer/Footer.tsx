import Link from "next/link";
export const Footer = ({ className }: { className?: string }) => (
  <footer className={`fr-footer ${className}`} role="contentinfo" id="footer">
    <div className="fr-container">
      <div className="fr-footer__body">
        <div className="fr-footer__brand fr-enlarge-link">
          <Link title="Accueil - Reva" href="/">
            <p className="fr-logo">
              République
              <br /> Française
            </p>
          </Link>
        </div>
        <div className="fr-footer__content">
          <p className="fr-footer__content-desc">Le site officiel de la VAE</p>
          <ul className="fr-footer__content-list">
            <li className="fr-footer__content-item">
              <a
                className="fr-footer__content-link"
                target="_blank"
                href="https://legifrance.gouv.fr"
                aria-label="legifrance.gouv.fr nouvelle page"
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
            <Link className="fr-footer__bottom-link" href="/plan-du-site/">
              Plan du site
            </Link>
          </li>
          <li className="fr-footer__bottom-item">
            <span className="fr-footer__bottom-link">
              Accessibilité: non conforme
            </span>
          </li>
          <li className="fr-footer__bottom-item">
            <Link className="fr-footer__bottom-link" href="/mentions-legales/">
              Mentions légales
            </Link>
          </li>
          <li className="fr-footer__bottom-item">
            <Link className="fr-footer__bottom-link" href="/confidentialite/">
              Données personnelles
            </Link>
          </li>
          <li className="fr-footer__bottom-item">
            <Link className="fr-footer__bottom-link" href="/mentions-legales/#">
              Gestion des cookies
            </Link>
          </li>
        </ul>
        <div className="fr-footer__bottom-copy">
          <p>
            Sauf mention contraire, tous les contenus de ce site sont sous{" "}
            <Link
              href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
              target="_blank"
              aria-label="licence etalab-2.0 nouvelle page"
            >
              licence etalab-2.0
            </Link>
          </p>
        </div>
      </div>
    </div>
  </footer>
);
