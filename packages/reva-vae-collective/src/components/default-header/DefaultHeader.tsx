import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

export const DefaultHeader = () => (
  <DsfrHeader
    brandTop={
      <>
        République
        <br />
        française
      </>
    }
    homeLinkProps={{
      href: "/../",
      title: "Accueil - France VAE",
    }}
    operatorLogo={{
      alt: "France VAE",
      imgUrl: "/vae-collective/images/fvae_logo.svg",
      orientation: "horizontal",
    }}
    classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
  />
);
