"use client";
import SideMenu from "@codegouvfr/react-dsfr/SideMenu";
import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";

const CertificationListLayout = ({ children }: { children: ReactNode }) => {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const searchFilter = searchParams.get("search") || "";

  const hrefSideMenu = (status: string | null) => {
    const params = new URLSearchParams();
    if (status) {
      params.set("status", status);
    }

    params.set("page", "1");

    if (searchFilter) {
      params.set("search", searchFilter);
    }

    return `/certifications/?${params.toString()}`;
  };

  const menuItem = (text: string, status: string | null) => ({
    isActive: status === statusParam,
    linkProps: {
      href: hrefSideMenu(status),
      target: "_self",
    },
    text,
  });

  return (
    <div className="w-full flex gap-6">
      <SideMenu
        className="flex-shrink-0 flex-grow-0 md:basis-[330px]"
        align="left"
        burgerMenuButtonText="Certifications"
        sticky
        fullHeight
        items={[
          menuItem("Toutes les certifications", null),
          menuItem("Certifications disponibles", "AVAILABLE"),
          menuItem("Certifications inactives", "INACTIVE"),
        ]}
      />
      {children}
    </div>
  );
};

export default CertificationListLayout;
