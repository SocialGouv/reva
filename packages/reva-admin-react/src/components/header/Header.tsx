"use client";
import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";
import { signOut } from "next-auth/react";

export const Header = () => (
  <DsfrHeader
    brandTop={
      <>
        république
        <br />
        française
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
  />
);
