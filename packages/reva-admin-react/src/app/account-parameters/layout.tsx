"use client";
import { ReactNode } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname } from "next/navigation";

const AccountParametersLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();

  const menuItem = (text: string, path: string) => ({
    isActive: currentPathname.startsWith(path),
    linkProps: {
      href: path,
      target: "_self",
    },
    text,
  });

  return (
    <div className="flex">
      <SideMenu
        align="left"
        burgerMenuButtonText="Paramètres du compte"
        title="Paramètres du compte"
        items={[
          menuItem(
            "Informations juridiques",
            "/account-parameters/legal-information",
          ),
          menuItem(
            "Informations commerciales",
            "/account-parameters/commercial-information",
          ),
          menuItem(
            "Informations administrateur",
            "/account-parameters/admin-information",
          ),
          menuItem(
            "Zone d'intervention",
            "/account-parameters/intervention-zone",
          ),
          menuItem(
            "Gestion des certifications",
            "/account-parameters/certifications",
          ),
          menuItem(
            "Gestion des absences et fermetures",
            "/account-parameters/absence",
          ),
        ]}
      />
      {children}
    </div>
  );
};

export default AccountParametersLayout;
