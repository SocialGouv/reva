"use client";

import { Header as DsfrHeader } from "@codegouvfr/react-dsfr/Header";

export const Header = () => {
  return (
    <DsfrHeader
      brandTop={
        <>
          République
          <br />
          française
        </>
      }
      homeLinkProps={{
        href: "/../",
        title: "Accueil - France VAE",
      }}
      classes={{ operator: "min-w-[9.0625rem] min-h-[90px]" }}
    />
  );
};
