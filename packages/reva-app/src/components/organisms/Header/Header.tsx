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
    serviceTitle="Reva"
    homeLinkProps={{
      href: "/",
      title: "Accueil - Reva - l'expérimentation de la VAE",
    }}
  />
);
