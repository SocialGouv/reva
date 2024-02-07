"use client";
import { ReactNode } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname } from "next/navigation";

const SubscriptionsLayout = ({ children }: { children: ReactNode }) => {
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
        burgerMenuButtonText="Inscriptions"
        sticky
        fullHeight
        items={[
          menuItem("Inscriptions en attente", "/subscriptions/pending"),
          menuItem("Inscriptions refusées", "/subscriptions/rejected"),
          menuItem("Inscriptions validées", "/subscriptions/validated"),
        ]}
      />
      <div className="mt-3">{children}</div>
    </div>
  );
};

export default SubscriptionsLayout;
