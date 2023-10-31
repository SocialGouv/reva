import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

export const Header = () => (
  <DsfrHeader
    brandTop={
      <>
        république
        <br />
        française
      </>
    }
    homeLinkProps={{
      href: "/",
      title: "Accueil - France VAE",
    }}
    operatorLogo={{
      alt: "France VAE",
      imgUrl: "/fvae_logo.svg",
      orientation: "horizontal",
    }}
  />
);
