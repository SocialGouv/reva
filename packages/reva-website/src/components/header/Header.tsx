import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useRouter } from "next/router";

export const Header = (props: { className?: string }) => {
  const { asPath } = useRouter();

  return (
    <DsfrHeader
      className={props.className}
      brandTop={<></>}
      serviceTitle="Reva"
      homeLinkProps={{
        href: "/",
        title: "Accueil - Reva",
      }}
      quickAccessItems={[
        {
          iconId: "fr-icon-arrow-right-line",
          linkProps: {
            href: "/admin",
            className: "fr-link--icon-right",
          },
          text: "Espace professionnel",
        },
        {
          iconId: "fr-icon-arrow-right-line",
          linkProps: {
            href: "/app/login",
            className: "fr-link--icon-right",
          },
          text: "Espace candidat",
        },
      ]}
      navigation={[
        {
          isActive: !!asPath.match(/\/espace-candidat/)?.length,
          linkProps: {
            href: "/espace-candidat",
          },
          text: "Je suis candidat",
        },
        {
          isActive: !!asPath.match(/\/espace-professionnel/)?.length,
          linkProps: {
            href: "/espace-professionnel",
          },
          text: "Je suis professionnel",
        },
      ]}
    />
  );
};
