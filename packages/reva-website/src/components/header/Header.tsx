import { push } from "@/components/analytics/matomo-tracker/matomoTracker";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export const Header = (props: { className?: string }) => {
  const { asPath } = useRouter();
  const [isClient, setIsClient] = useState(false);
  const { isFeatureActive } = useFeatureflipping();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navigation = [
    {
      isActive: !!asPath.match(/\/espace-candidat/)?.length,
      linkProps: {
        href: "/espace-candidat",
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
      isActive:
        !!asPath.match(/\/savoir-plus/)?.length ||
        !!asPath.match(/\/nous-contacter/)?.length ||
        !!asPath.match(/\/faq/)?.length,
      text: "Besoin d'aide ?",
      menuLinks: [
        ...[
          {
            linkProps: {
              href: "/savoir-plus",
            },
            isActive: !!asPath.match(/\/savoir-plus/)?.length,
            text: "En savoir plus sur la VAE",
          },
        ],
        ...(isFeatureActive("FAQ_SITE_INSTITUTIONNEL")
          ? [
              {
                linkProps: {
                  href: "/faq",
                },
                isActive: !!asPath.match(/\/savoir-plus/)?.length,
                text: "Questions fréquentes",
              },
            ]
          : []),
        ...[
          {
            linkProps: {
              href: "/nous-contacter",
            },
            isActive: !!asPath.match(/\/nous-contacter/)?.length,
            text: "Nous contacter",
          },
        ],
      ],
    },
  ];

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
      serviceTitle="Le service public de la Validation des Acquis de l'Expérience"
      classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
      quickAccessItems={[
        {
          iconId: "fr-icon-briefcase-fill",
          linkProps: {
            href: "/admin",
            className: "fr-link--icon-right",
            onClick: () =>
              push([
                "trackEvent",
                "En-tête",
                "Click sur 'Connexion professionnel'",
                "Click sur 'Connexion professionnel'",
              ]),
          },
          text: "Connexion professionnel",
        },
        {
          iconId: "fr-icon-account-circle-fill",
          linkProps: {
            href: "/app/login",
            className: "fr-link--icon-right",
            onClick: () =>
              push([
                "trackEvent",
                "En-tête",
                "Click sur 'Connexion candidat'",
                "Click sur 'Connexion candidat'",
              ]),
          },
          text: "Connexion candidat",
        },
      ]}
      navigation={isClient ? navigation : []}
    />
  );
};
