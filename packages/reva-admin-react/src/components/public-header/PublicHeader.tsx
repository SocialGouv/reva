import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

import { WEBSITE_BASE_URL } from "@/config/config";

export const PublicHeader = () => (
  <DsfrHeader
    brandTop={
      <>
        République
        <br />
        Française
      </>
    }
    homeLinkProps={{
      href: WEBSITE_BASE_URL,
      title: "Accueil - France VAE",
      target: "_self",
    }}
    operatorLogo={{
      alt: "France VAE",
      imgUrl: "/admin2/fvae_logo.svg",
      orientation: "horizontal",
    }}
    classes={{ operator: "min-w-[128px] min-h-[72px]" }}
    serviceTitle="Le service public de la VAE"
    serviceTagline="Espace professionnel de la VAE"
  />
);
