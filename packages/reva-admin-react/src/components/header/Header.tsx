"use client";
import { useAuth } from "@/components/auth/auth";
import { ADMIN_ELM_URL } from "@/config/config";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

export const Header = () => {
  const currentPathName = usePathname();
  const { isAdmin, isOrganism } = useAuth();

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
        href: "../",
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
      navigation={[
        {
          text: "Candidatures",
          linkProps: {
            href: ADMIN_ELM_URL + "/candidacies",
            target: "_self",
          },
        },
        ...(isOrganism && !isAdmin
          ? [
              {
                text: "Paramètres du compte",
                linkProps: {
                  href: "/account-parameters",
                  target: "_self",
                },
                isActive: currentPathName.startsWith("/account-parameters"),
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
            ]
          : []),
      ]}
    />
  );
};
