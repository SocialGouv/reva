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
    quickAccessItems={[
      {
        iconId: "fr-icon-account-line",
        linkProps: {
          className: "",
          href: "/app",
        },
        text: "Connexion",
      },
      {
        iconId: "fr-icon-account-line",
        linkProps: {
          className: "!bg-[#F8F8F8]  ",
          href: "/admin",
        },
        text: "Pro",
      },
      {
        iconId: "fr-icon-account-line",
        linkProps: {
          className: "!bg-[#000091] !text-white  ",
          href: "/app",
        },
        text: "Démarrer mon parcours VAE",
      },
    ]}
  />
);
