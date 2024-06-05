"use client";
import { ReactNode, useCallback } from "react";
import { SideMenu } from "@codegouvfr/react-dsfr/SideMenu";
import { usePathname, useSearchParams } from "next/navigation";

const AccountsLayout = ({ children }: { children: ReactNode }) => {
  const currentPathname = usePathname();

  const menuItem = (text: string, path: string) => ({
    isActive: path.startsWith(currentPathname),
    linkProps: {
      href: path,
      target: "_self",
    },
    text,
  });

  const searchParams = useSearchParams();
  const searchFilter = searchParams.get("search") || "";

  const hrefSideMenu = useCallback(
    (subPath: string) => {
      const params = new URLSearchParams();
      params.set("page", "1");

      if (searchFilter) {
        params.set("search", searchFilter);
      }

      return `/accounts/${subPath}/?${params.toString()}`;
    },
    [searchFilter],
  );

  return (
    <div className="flex flex-col flex-1 md:flex-row gap-10 md:gap-0">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px]"
        align="left"
        burgerMenuButtonText="Accounts"
        sticky
        fullHeight
        items={[
          menuItem("AAP", hrefSideMenu("organisms")),
          menuItem("Certificateur", hrefSideMenu("certification-authorities")),
        ]}
      />
      <div className="mt-3">{children}</div>
    </div>
  );
};

export default AccountsLayout;
