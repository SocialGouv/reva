import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

export const Header = (props: { className?: string }) => (
  <DsfrHeader
    className={props.className}
    brandTop={<></>}
    serviceTitle="France VAE"
    homeLinkProps={{
      href: "/",
      title: "Accueil - France VAE",
    }}
    navigation={[
      {
        linkProps: {
          href: "/espace-professionnel/creation",
          target: "_self",
        },
        text: "Espace pro",
      },
    ]}
  />
);
