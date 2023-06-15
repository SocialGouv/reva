import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

export const Header = (props: { className?: string }) => (
  <DsfrHeader
    className={props.className}
    brandTop={
      <>
        République
        <br /> Française
      </>
    }
    operatorLogo={{
      alt: "France VAE",
      imgUrl: "/app/fvae_logo.svg",
      orientation: "horizontal",
    }}
    homeLinkProps={{
      href: "/",
      title: "Accueil - France VAE",
    }}
  />
);
