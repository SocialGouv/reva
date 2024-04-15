"use client";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export const AgenciesSettingsLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const currentPathname = usePathname();

  const getNavItem = ({ text, href }: { text: string; href: string }) => ({
    text,
    linkProps: { href },
    isActive: !!currentPathname.match(new RegExp(`^${href}.*$`)),
  });

  return (
    <div className="flex">
      <SideMenu
        className="flex-shrink-0 md:w-[330px]"
        align="left"
        classes={{ inner: "h-full" }}
        burgerMenuButtonText="Agences"
        title="Paramètres des agences"
        fullHeight
        items={[
          getNavItem({
            text: "Informations juridiques",
            href: "/agencies-settings/legal-information",
          }),
        ]}
      />
      {children}
    </div>
  );
};

export default AgenciesSettingsLayout;
