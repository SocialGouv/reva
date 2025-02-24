"use client";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";

export const Header = (props: { className?: string }) => {
  const pathname = usePathname() || "";
  const [isClient, setIsClient] = useState(false);
  const { isFeatureActive } = useFeatureflipping();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navigation = [
    ...(isFeatureActive("HOMEPAGE_V2")
      ? [
          {
            isActive: !!pathname.match(/^\/$/)?.length,
            linkProps: {
              href: "/",
            },
            text: "Accueil",
          },
          {
            isActive:
              !!pathname.match(/\/espace-candidat/)?.length ||
              !!pathname.match(/\/inscription-candidat/)?.length ||
              !!pathname.match(/\/certifications/)?.length,
            linkProps: {
              href: "/espace-candidat",
            },
            text: "Candidats",
          },
        ]
      : [
          {
            isActive: !!pathname.match(/^\/$/)?.length,
            linkProps: {
              href: "/",
            },
            text: "Candidats",
          },
        ]),
    {
      isActive: !!pathname.match(/\/espace-professionnel/)?.length,
      linkProps: {
        href: "/espace-professionnel",
      },
      text: "Professionnels",
    },
    {
      isActive: !!pathname.match(/\/savoir-plus/)?.length,
      text: "Espace d'informations",
      menuLinks: [
        {
          linkProps: {
            href: "/savoir-plus",
          },
          isActive: !!pathname.match(/\/savoir-plus\/?$/)?.length,
          text: "Nos articles sur la VAE",
        },
        {
          linkProps: {
            href: "/savoir-plus/articles/reglementation-vae/",
          },
          isActive: !!pathname.match(/\/reglementation-vae/)?.length,
          text: "Règlementation",
        },
      ],
    },

    {
      isActive: !!pathname.match(/\/regions/)?.length,
      linkProps: {
        href: "/regions",
      },
      text: "La VAE dans votre région",
    },

    {
      isActive:
        !!pathname.match(/\/nous-contacter/)?.length ||
        !!pathname.match(/\/faq/)?.length,
      text: "Besoin d'aide ?",
      menuLinks: [
        {
          linkProps: {
            href: "/faq",
          },
          isActive: !!pathname.match(/\/savoir-plus/)?.length,
          text: "Questions fréquentes",
        },

        {
          linkProps: {
            href: "/nous-contacter",
          },
          isActive: !!pathname.match(/\/nous-contacter/)?.length,
          text: "Nous contacter",
        },
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
            href: `/candidat/login`,
            className: "fr-link--icon-right",
          },
          text: "Connexion candidat",
        },
      ]}
      navigation={isClient ? navigation : []}
    />
  );
};
