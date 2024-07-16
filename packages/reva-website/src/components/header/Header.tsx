import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { useFeatureflipping } from "../feature-flipping/featureFlipping";

export const Header = (props: { className?: string }) => {
  const { asPath } = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navigation = [
    {
      isActive: !!asPath.match(/^\/$/)?.length,
      linkProps: {
        href: "/",
      },
      text: "Candidats",
    },
    {
      isActive: !!asPath.match(/\/espace-professionnel/)?.length,
      linkProps: {
        href: "/espace-professionnel",
      },
      text: "Professionnels",
    },
    {
      isActive: !!asPath.match(/\/savoir-plus/)?.length,
      text: "Espace d'informations",
      menuLinks: [
        {
          linkProps: {
            href: "/savoir-plus",
          },
          isActive: !!asPath.match(/\/savoir-plus\/?$/)?.length,
          text: "Nos articles sur la VAE",
        },
        {
          linkProps: {
            href: "/savoir-plus/articles/reglementation-vae/",
          },
          isActive: !!asPath.match(/\/reglementation-vae/)?.length,
          text: "Règlementation",
        },
      ],
    },

    {
      isActive: !!asPath.match(/\/regions/)?.length,
      linkProps: {
        href: "/regions",
      },
      text: "La VAE dans votre région",
    },

    {
      isActive:
        !!asPath.match(/\/nous-contacter/)?.length ||
        !!asPath.match(/\/faq/)?.length,
      text: "Besoin d'aide ?",
      menuLinks: [
        {
          linkProps: {
            href: "/faq",
          },
          isActive: !!asPath.match(/\/savoir-plus/)?.length,
          text: "Questions fréquentes",
        },

        {
          linkProps: {
            href: "/nous-contacter",
          },
          isActive: !!asPath.match(/\/nous-contacter/)?.length,
          text: "Nous contacter",
        },
      ],
    },
  ];

  const { isFeatureActive } = useFeatureflipping();
  const isRevaCandidateActive = isFeatureActive("REVA_CANDIDATE");

  return (
    <DsfrHeader
      className={props.className}
      brandTop={
        <>
          République
          <br />
          Française
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
      serviceTitle="Le service public de la VAE"
      classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
      quickAccessItems={[
        {
          iconId: "fr-icon-briefcase-fill",
          linkProps: {
            href: "/admin2",
            className: "fr-link--icon-right",
          },
          text: "Connexion professionnel",
        },
        {
          iconId: "fr-icon-account-circle-fill",
          linkProps: {
            href: `/${isRevaCandidateActive ? "candidat" : "app"}/login`,
            className: "fr-link--icon-right",
          },
          text: "Connexion candidat",
        },
      ]}
      navigation={isClient ? navigation : []}
    />
  );
};
