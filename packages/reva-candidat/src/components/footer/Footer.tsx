import Image from "next/image";
import Link from "next/link";

export const Footer = () => (
  <footer className="fr-footer" role="contentinfo" id="footer">
    <div className="fr-container">
      <div className="fr-footer__body">
        <div className="fr-footer__brand fr-enlarge-link">
          <p className="fr-logo">
            République
            <br /> Française
          </p>
          <Link
            title="Accueil - France VAE"
            href="/../"
            className="fr-footer__brand-link"
          >
            <Image
              className="fr-footer__logo"
              width="225"
              height="138"
              src="/candidat/fvae_logo.svg"
              alt="France VAE"
            />
          </Link>
        </div>
        <div className="fr-footer__content">
          <p className="fr-footer__content-desc">
            France VAE est le portail officiel du service public qui vise à
            transformer la VAE avec nos partenaires.
          </p>
          <ul className="fr-footer__content-list">
            <li className="fr-footer__content-item">
              <a
                className="fr-footer__content-link"
                target="_blank"
                href="http://info.gouv.fr/"
                aria-label="gouvernement.fr nouvelle page"
              >
                info.gouv.fr
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
            <Link
              className="fr-footer__bottom-link"
              href="/../declaration-accessibilite/"
            >
              Accessibilité : partiellement conforme
            </Link>
          </li>
          <li className="fr-footer__bottom-item">
            <Link className="fr-footer__bottom-link" href="/../cgu-candidat/">
              CGU
            </Link>
          </li>
          <li className="fr-footer__bottom-item">
            <Link
              className="fr-footer__bottom-link"
              href="/../mentions-legales/"
            >
              Mentions légales
            </Link>
          </li>
          <li className="fr-footer__bottom-item">
            <Link
              className="fr-footer__bottom-link"
              href="/../confidentialite/"
            >
              Données personnelles
            </Link>
          </li>
          <li className="fr-footer__bottom-item">
            <Link className="fr-footer__bottom-link" href="/../nous-contacter">
              Nous&nbsp;contacter
            </Link>
          </li>
        </ul>
        <div className="fr-footer__bottom-copy">
          <p className="mb-4">
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
