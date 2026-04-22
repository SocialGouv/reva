"use client";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ConnectionDropdown } from "./ConnectionDropdown";

export const Header = (props: { className?: string }) => {
  const pathname = usePathname() || "";
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const navigation = [
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
        !!pathname.match(/\/certifications/)?.length,
      linkProps: {
        href: "/espace-candidat",
      },
      text: "Candidats",
    },
    {
      isActive: !!pathname.match(/\/espace-professionnel/)?.length,
      menuLinks: [
        {
          linkProps: {
            href: "/savoir-plus/articles/lancez-votre-projet-de-vae-collective/",
          },
          isActive: !!pathname.match(
            /\/savoir-plus\/articles\/lancez-votre-projet-de-vae-collective/,
          )?.length,
          text: "Porteurs de projets de VAE collective",
        },
        {
          linkProps: {
            href: "/savoir-plus/articles/espace-architecte-accompagnateur-de-parcours/",
          },
          isActive: !!pathname.match(
            /\/savoir-plus\/articles\/espace-architecte-accompagnateur-de-parcours/,
          )?.length,
          text: "Architectes Accompagnateurs de Parcours",
        },
        {
          linkProps: {
            href: "/savoir-plus/articles/espace-certificateurs/",
          },
          isActive: !!pathname.match(
            /\/savoir-plus\/articles\/espace-certificateurs/,
          )?.length,
          text: "Certificateurs",
        },
      ],
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
      linkProps: {
        href: "/faq",
      },
      isActive: !!pathname.match(/\/faq/)?.length,
      text: "Questions fréquentes",
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
      classes={{ operator: "min-w-[128px] min-h-[72px]" }}
      quickAccessItems={
        isClient ? [<ConnectionDropdown key="connection" />] : []
      }
      navigation={isClient ? navigation : []}
    />
  );
};
