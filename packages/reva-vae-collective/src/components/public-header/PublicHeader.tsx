import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

export const PublicHeader = () => (
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
    classes={{ operator: "min-w-[128px] min-h-[72px]" }}
    serviceTitle="Le service public de la VAE"
    serviceTagline="Espace porteur de projet VAE collective"
  />
);
