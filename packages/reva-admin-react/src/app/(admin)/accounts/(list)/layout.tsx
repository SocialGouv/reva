"use client";
import { ReactNode } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname } from "next/navigation";

const AccountsLayout = ({ children }: { children: ReactNode }) => {
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
    <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px]"
        align="left"
        burgerMenuButtonText="Accounts"
        sticky
        fullHeight
        items={[
          menuItem("APP", "/accounts/organisms"),
          menuItem("Certificateur", "/accounts/certification-authorities"),
        ]}
      />
      <div className="mt-3">{children}</div>
    </div>
  );
};

export default AccountsLayout;
