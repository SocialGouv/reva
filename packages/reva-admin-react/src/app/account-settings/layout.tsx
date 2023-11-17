"use client";
import { ReactNode } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname } from "next/navigation";

const AccountSettingsLayout = ({ children }: { children: ReactNode }) => {
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
            "/account-settings/legal-information",
          ),
          menuItem(
            "Informations commerciales",
            "/account-settings/commercial-information",
          ),
          menuItem(
            "Informations administrateur",
            "/account-settings/admin-information",
          ),
          menuItem(
            "Zone d'intervention",
            "/account-settings/intervention-zone",
          ),
          menuItem(
            "Gestion des certifications",
            "/account-settings/certifications",
          ),
          menuItem(
            "Gestion des absences et fermetures",
            "/account-settings/absence",
          ),
        ]}
      />
      {children}
    </div>
  );
};

export default AccountSettingsLayout;
