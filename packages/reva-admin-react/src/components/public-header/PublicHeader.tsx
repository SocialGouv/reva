import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

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
      href: "/admin2/login",
      title: "Accueil - France VAE",
    }}
    serviceTitle="France VAE"
    serviceTagline="Espace professionnel"
  />
);
