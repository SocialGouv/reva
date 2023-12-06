"use client";
import { useAuth } from "@/components/auth/auth";
import { useFeatureflipping } from "@/components/feature-flipping/featureFlipping";
import { ADMIN_ELM_URL } from "@/config/config";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export const Header = () => {
  const currentPathname = usePathname();
  const { isAdmin, isOrganism, isGestionnaireMaisonMereAAP } = useAuth();
  const { isFeatureActive } = useFeatureflipping();

  const { status } = useSession();

  const navigation =
    status === "authenticated"
      ? [
          {
            text: "Candidatures",
            linkProps: {
              href: ADMIN_ELM_URL + "/candidacies",
              target: "_self",
            },
          },
          ...(isGestionnaireMaisonMereAAP && isFeatureActive("AAP_AGENCES")
            ? [
                {
                  text: "Gestion des agences",
                  linkProps: {
                    href: "/agences/",
                    target: "_self",
                  },
                  isActive: currentPathname.startsWith("/agences"),
                },
              ]
            : []),
          ...(isOrganism && !isAdmin
            ? [
                {
                  text: "Paramètres du compte",
                  linkProps: {
                    href: "/account-settings/commercial-information",
                    target: "_self",
                  },
                  isActive: currentPathname.startsWith("/account-settings"),
                },
              ]
            : []),
          ...(isAdmin
            ? [
                {
                  text: "Inscriptions",
                  linkProps: {
                    href: ADMIN_ELM_URL + "/subscritpions",
                    target: "_self",
                  },
                },
                {
                  text: "Comptes",
                  linkProps: {
                    href: ADMIN_ELM_URL + "/accounts",
                    target: "_self",
                  },
                },
                {
                  text: "Certifications",
                  linkProps: {
                    href: ADMIN_ELM_URL + "/certifications",
                    target: "_self",
                  },
                },
                {
                  text: "Dossiers de faisabilité",
                  linkProps: {
                    href: ADMIN_ELM_URL + "/feasibilities",
                    target: "_self",
                  },
                },
              ]
            : []),
        ]
      : [];

  return (
    <DsfrHeader
      brandTop={
        <>
          république
          <br />
          française
        </>
      }
      homeLinkProps={{
        href: "/../",
        title: "Accueil - France VAE",
      }}
      operatorLogo={{
        alt: "France VAE",
        imgUrl: "/admin2/fvae_logo.svg",
        orientation: "horizontal",
      }}
      quickAccessItems={[
        {
          buttonProps: {
            onClick: () => signOut({ redirect: false }),
            className: "!text-sm !px-3 !py-1 !mb-4 !mx-1",
          },
          iconId: "ri-logout-box-r-line",
          text: "Se déconnecter",
        },
      ]}
      navigation={navigation}
    />
  );
};
